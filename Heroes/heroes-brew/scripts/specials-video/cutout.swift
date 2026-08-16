// Foreground (food) cutout → transparent PNG, via Apple Vision subject lifting.
// Build: swiftc -O scripts/specials-video/cutout.swift -o /tmp/cutout
// Run:   /tmp/cutout <input-image> <output.png>
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { FileHandle.standardError.write("usage: cutout <in> <out.png>\n".data(using: .utf8)!); exit(64) }
let inPath = args[1], outPath = args[2]

guard let nsimg = NSImage(contentsOfFile: inPath),
      let cg = nsimg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("cannot load image\n".data(using: .utf8)!); exit(2)
}

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([req]) } catch { FileHandle.standardError.write("vision failed: \(error)\n".data(using: .utf8)!); exit(3) }
guard let result = req.results?.first else { FileHandle.standardError.write("no foreground found\n".data(using: .utf8)!); exit(4) }

let mask: CVPixelBuffer
do { mask = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler) }
catch { FileHandle.standardError.write("mask gen failed: \(error)\n".data(using: .utf8)!); exit(5) }

let src = CIImage(cgImage: cg)
// Refine the matte: erode inward to cut the background halo, steepen the alpha
// transition for a crisp edge, then a hair of blur for anti-aliasing.
let erode = Double(args.count > 3 ? Double(args[3]) ?? 2.0 : 2.0)
let contrast = Double(args.count > 4 ? Double(args[4]) ?? 4.5 : 4.5)
let maskCI = CIImage(cvPixelBuffer: mask).clampedToExtent()
  .applyingFilter("CIMorphologyMinimum", parameters: [kCIInputRadiusKey: erode])
  .applyingFilter("CIColorControls", parameters: [kCIInputContrastKey: contrast])
  .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 0.6])
  .cropped(to: src.extent)
let blend = CIFilter(name: "CIBlendWithMask")!
blend.setValue(src, forKey: kCIInputImageKey)
blend.setValue(CIImage.empty(), forKey: kCIInputBackgroundImageKey) // transparent where mask=0
blend.setValue(maskCI, forKey: kCIInputMaskImageKey)
guard let out = blend.outputImage else { FileHandle.standardError.write("blend failed\n".data(using: .utf8)!); exit(6) }

let ctx = CIContext()
guard let outCG = ctx.createCGImage(out, from: src.extent) else { FileHandle.standardError.write("render failed\n".data(using: .utf8)!); exit(7) }
let rep = NSBitmapImageRep(cgImage: outCG)
guard let png = rep.representation(using: .png, properties: [:]) else { FileHandle.standardError.write("png encode failed\n".data(using: .utf8)!); exit(8) }
do { try png.write(to: URL(fileURLWithPath: outPath)) } catch { FileHandle.standardError.write("write failed: \(error)\n".data(using: .utf8)!); exit(9) }
print("ok \(outPath)")

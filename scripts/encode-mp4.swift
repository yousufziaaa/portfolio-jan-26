// Encodes a folder of same-sized PNG frames into an H.264 MP4 with
// AVFoundation, so the OG video needs nothing beyond macOS itself.
//
//   swift scripts/encode-mp4.swift <frames-dir> <fps> <out.mp4>
//
// Frames are taken in filename order. Called by scripts/brand.mjs.
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 4, let fps = Int32(args[2]) else {
  FileHandle.standardError.write("usage: encode-mp4.swift <frames-dir> <fps> <out.mp4>\n".data(using: .utf8)!)
  exit(2)
}
let dir = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[3])

let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension.lowercased() == "png" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }
guard !files.isEmpty else { fatalError("no PNG frames in \(dir.path)") }

func load(_ url: URL) -> CGImage {
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
    let img = CGImageSourceCreateImageAtIndex(src, 0, nil)
  else { fatalError("can't read \(url.path)") }
  return img
}

let first = load(files[0])
let width = first.width
let height = first.height

try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
// Index first (fast start), so link previews can play before it's all downloaded.
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(
  mediaType: .video,
  outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
      AVVideoAverageBitRateKey: 2_500_000,
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
    ],
    AVVideoColorPropertiesKey: [
      AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
      AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
      AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
    ],
  ])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
  ])
writer.add(input)
guard writer.startWriting() else { fatalError("can't start: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)

for (i, file) in files.enumerated() {
  let img = i == 0 ? first : load(file)
  while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
  guard let pool = adaptor.pixelBufferPool else { fatalError("no pixel buffer pool") }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb)
  guard let buffer = pb else { fatalError("no pixel buffer") }
  CVPixelBufferLockBaseAddress(buffer, [])
  let ctx = CGContext(
    data: CVPixelBufferGetBaseAddress(buffer), width: width, height: height, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: width, height: height))
  CVPixelBufferUnlockBaseAddress(buffer, [])
  if !adaptor.append(buffer, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps)) {
    fatalError("append failed at frame \(i): \(String(describing: writer.error))")
  }
}

input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
guard writer.status == .completed else { fatalError("write failed: \(String(describing: writer.error))") }
print("wrote \(files.count) frames to \(out.path)")

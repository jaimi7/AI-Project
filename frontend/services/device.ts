import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { Browser } from '@capacitor/browser'
import { Clipboard } from '@capacitor/clipboard'

export const scanQrCode = async (): Promise<string> => {
  const result = await CapacitorBarcodeScanner.scanBarcode({
    hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
    cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
    scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
    scanInstructions: 'Scan a review QR code',
    scanButton: false,
    web: { showCameraSelection: true },
  })
  return result.ScanResult.trim()
}

export const copyText = async (value: string): Promise<void> => {
  await Clipboard.write({ string: value })
}

export const openExternalUrl = async (url: string): Promise<void> => {
  await Browser.open({ url })
}

export type ParsedReviewQr = {
  reviewUrl: string
  placeName?: string
}

export const parseReviewQr = (rawValue: string): ParsedReviewQr => {
  const value = rawValue.trim()
  if (!value) throw new Error('The QR code is empty')

  if (value.startsWith('reviewapp://')) {
    const url = new URL(value)
    const reviewUrl = url.searchParams.get('url') ?? ''
    if (!reviewUrl) throw new Error('The QR code does not contain a review URL')
    const parsed = new URL(reviewUrl)
    if (parsed.protocol !== 'https:') throw new Error('Only secure review URLs are supported')
    return {
      reviewUrl: parsed.toString(),
      placeName: url.searchParams.get('name') || undefined,
    }
  }

  const parsed = new URL(value)
  if (parsed.protocol !== 'https:') throw new Error('Only secure review URLs are supported')
  return { reviewUrl: parsed.toString() }
}

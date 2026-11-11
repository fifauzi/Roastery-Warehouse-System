import QRCode from 'qrcode';

export interface QRLabelData {
  type: 'roasted' | 'green';
  title: string;
  code: string; // Batch # or Lot #
  subTitle: string;
  weight: string;
  dateLabel: string;
  dateValue: string;
  profileOrProcess: string;
  metaNotes?: string;
  facility: string;
}

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed generating QR code', err);
    return '';
  }
}

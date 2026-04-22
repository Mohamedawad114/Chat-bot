export interface IEmailData {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

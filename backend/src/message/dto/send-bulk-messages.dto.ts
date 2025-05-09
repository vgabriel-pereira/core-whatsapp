export class SendBulkMessagesDto {
    contacts: Array<{
      phone: string;
      name: string;
    }>;
    message: string;
  }
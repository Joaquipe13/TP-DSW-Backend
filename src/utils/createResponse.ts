type Status =
  | "Success"
  | "Bad Request"
  | "Error"
  | "Redirect"
  | "Informational"
  | "Unauthorized"
  | "Forbidden"
  | "Not Found";

type MessageType =
  | string
  | string[]
  | { message: string }
  | { message: string }[];

const createResponse = (status: Status, message: MessageType, data?: any) => ({
  status,
  message,
  data,
});

export { createResponse };

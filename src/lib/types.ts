export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

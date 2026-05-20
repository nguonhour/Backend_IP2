export interface AbaPushbackPayload {
  req_time?: string;
  reqTime?: string;
  merchant_id?: string;
  merchantId?: string;
  tran_id?: string;
  tranId?: string;
  transactionId?: string;
  amount?: string | number;
  status?: string;
  status_code?: string;
  statusCode?: string;
  payment_status?: string;
  paymentStatus?: string;
  hash?: string;
  signature?: string;
  hmac?: string;
  code?: string;
  result_code?: string;
  [key: string]: unknown;
}

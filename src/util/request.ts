import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Response<T = any> extends AxiosResponse<T> {}

export type RequestError<T = unknown> = AxiosError<T>

export class Request {

  constructor(private request = axios) {}

  public async get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config)
  }

  public static isRequestError(error: Error): boolean {
    return !!((error as AxiosError).response && (error as AxiosError).response?.status)
  }
}
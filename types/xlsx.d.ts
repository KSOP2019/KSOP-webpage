declare module 'xlsx' {
  export function read(data: ArrayBuffer | Buffer | Uint8Array, opts?: { type?: string }): any
  export const utils: {
    sheet_to_json(ws: any, opts?: any): any[]
  }
}

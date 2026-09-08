declare module 'xlsx' {
  export function read(data: ArrayBuffer | Buffer | Uint8Array, opts?: { type?: string }): any
  export function write(wb: any, opts?: any): ArrayBuffer
  export const utils: {
    sheet_to_json(ws: any, opts?: any): any[]
    aoa_to_sheet(data: any[][], opts?: any): any
  }
}

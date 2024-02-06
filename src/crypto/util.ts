import * as libsignal from "@privacyresearch/libsignal-protocol-typescript";
export const util = (function () {
  'use strict';
  var StaticArrayBufferProto = Object.getPrototypeOf(new ArrayBuffer(1));

  return {
    toString(thing: string | ArrayBuffer) {
      if (typeof thing == 'string') {
        return thing;
      }
      if (thing instanceof ArrayBuffer) {
        return Buffer.from(thing).toString('binary');
      }
      throw new Error('Expected string or ArrayBuffer');
      // return new dcodeIO.ByteBuffer.wrap(thing).toString('binary');
    },
    toArrayBuffer(thing: any) {
      if (thing === undefined) {
        return undefined;
      }
      if (thing instanceof ArrayBuffer) {
        return thing;
      }
      let str;
      if (typeof thing === "string") {
        str = thing;
      } else {
        throw new Error("Tried to convert a non-string of type " + typeof thing + " to an array buffer");
      }
      return Buffer.from(str, 'binary').buffer;
    },
    isEqual(a: ArrayBuffer, b: ArrayBuffer) {
      // TODO: Special-case arraybuffers, etc
      if (a === undefined || b === undefined) {
        return false;
      }
      let a2 = util.toString(a);
      let b2 = util.toString(b);
      var maxLength = Math.max(a2.length, b2.length);
      if (maxLength < 5) {
        throw new Error("a/b compare too short");
      }
      return a2.substring(0, Math.min(maxLength, a2.length)) == b2.substring(0, Math.min(maxLength, b2.length));
    },
    arrayBufferToBase64: (buffer: ArrayBuffer) => {
      let binary = '';
      let bytes = new Uint8Array(buffer);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return Buffer.from(binary, 'binary').toString('base64');
    },
    base64ToArrayBuffer: (base64: string) => {
      let binary_string = Buffer.from(base64, 'base64').toString('binary');
      // or, using atob if you prefer
      // let binary_string = Buffer.from(window.atob(base64), 'binary').toString('binary');
      let len = binary_string.length;
      let bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    }
  };
})();

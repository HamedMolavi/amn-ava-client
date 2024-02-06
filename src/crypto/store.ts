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
      return window.btoa(binary);
    },
    base64ToArrayBuffer: (base64: string) => {
      // // Create a buffer from the base64 string
      // const buffer = Buffer.from(base64, 'base64');
      // // Convert the buffer to an ArrayBuffer
      // const arrayBuffer = Uint8Array.from(buffer).buffer;
      // return arrayBuffer;

      let binary_string = window.atob(base64);
      let len = binary_string.length;
      let bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    }
  };
})();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class SignalProtocolStore {
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  store: object & { [key: string]: libsignal.KeyPairType<ArrayBuffer> | ArrayBuffer | number | string | libsignal.SessionCipher | libsignal.SessionBuilder }
  Direction = {
    SENDING: 1,
    RECEIVING: 2,
  }
  constructor() {
    this.store = {};
  }

  getIdentityKeyPair() {
    return Promise.resolve(this.get('identityKey')) as Promise<libsignal.KeyPairType<ArrayBuffer>>;
  }

  getLocalRegistrationId() {
    return Promise.resolve(this.get('registrationId')) as Promise<number>;
  }
  put(key: string, value: libsignal.KeyPairType<ArrayBuffer> | number | ArrayBuffer) {
    if (key === undefined || value === undefined || key === null || value === null)
      throw new Error("Tried to store undefined/null");
    this.store[key] = value;
  }
  get(key: string, defaultValue: libsignal.KeyPairType<ArrayBuffer> | undefined | number = undefined) {
    if (key === null || key === undefined)
      throw new Error("Tried to get value for undefined/null key");
    if (key in this.store) {
      return this.store[key];
    } else {
      return defaultValue;
    }
  }

  remove(key: string) {
    if (key === null || key === undefined)
      throw new Error("Tried to remove value for undefined/null key");
    delete this.store[key];
  }

  isTrustedIdentity(identifier: string, identityKey: ArrayBuffer, direction: libsignal.Direction) {
    if (identifier === null || identifier === undefined) {
      throw new Error("tried to check identity key for undefined/null key");
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error("Expected identityKey to be an ArrayBuffer");
    }
    var trusted = this.get('identityKey' + identifier) as ArrayBuffer | undefined;
    if (trusted === undefined) {
      return Promise.resolve(true);
    }
    return Promise.resolve(util.toString(identityKey) === util.toString(trusted));
  }

  loadIdentityKey(identifier: string) {
    if (identifier === null || identifier === undefined)
      throw new Error("Tried to get identity key for undefined/null key");
    return Promise.resolve(this.get('identityKey' + identifier));
  }

  saveIdentity(identifier: string, identityKey: ArrayBuffer) {
    if (identifier === null || identifier === undefined) throw new Error("Tried to put identity key for undefined/null key");
    var address = libsignal.SignalProtocolAddress.fromString(identifier);

    var existing = this.get('identityKey' + address.getName()) as ArrayBuffer | undefined;
    this.put('identityKey' + address.getName(), identityKey)

    if (existing && util.toString(identityKey) !== util.toString(existing)) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }

  }

  /* Returns a prekeypair object or undefined */
  loadPreKey(keyId: number | string) {
    var res = this.get('25519KeypreKey' + keyId) as libsignal.KeyPairType<ArrayBuffer> | undefined;
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    }
    return Promise.resolve(res);
  }
  storePreKey(keyId: string | number, keyPair: libsignal.KeyPairType<ArrayBuffer>) {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
  }
  removePreKey(keyId: number | string) {
    return Promise.resolve(this.remove('25519KeypreKey' + keyId));
  }

  /* Returns a signed keypair object or undefined */
  loadSignedPreKey(keyId: number | string) {
    var res = this.get('25519KeysignedKey' + keyId) as libsignal.KeyPairType<ArrayBuffer> | undefined;
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    }
    return Promise.resolve(res);
  }
  storeSignedPreKey(keyId: number | string, keyPair: libsignal.KeyPairType<ArrayBuffer>) {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair));
  }
  removeSignedPreKey(keyId: number | string) {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  }

  loadSession(identifier: string | number) {
    return Promise.resolve(this.get('session' + identifier)) as Promise<string | undefined>;
  }
  storeSession(identifier: string | number, record: any) {
    return Promise.resolve(this.put('session' + identifier, record));
  }
  removeSession(identifier: number | string) {
    return Promise.resolve(this.remove('session' + identifier));
  }
  removeAllSessions(identifier: number | string) {
    for (var id in this.store) {
      if (id.startsWith('session' + identifier)) {
        delete this.store[id];
      }
    }
    return Promise.resolve();
  }

  /* Stores and loads a session cipher */
  storeSessionCipher(identifier: string | number, cipher: any) {
    this.put('cipher' + identifier, cipher);
  }
  loadSessionCipher(identifier: string | number) {
    var cipher = this.get('cipher' + identifier);

    if (cipher == undefined) {
      return null;
    } else {
      return cipher as libsignal.SessionCipher;
    }
  }
};

export default SignalProtocolStore


////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class SignalServerStore {
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Dummy signal server connector.
   * In a real application this component would connect to your signal 
   * server for storing and fetching user public keys over HTTP.
   */
  /**
   * When a user logs on they should generate their keys and then register them with the server.
   * 
   * @param userId The user ID.
   * @param preKeyBundle The user's generated pre-key bundle.
   */
  registerNewPreKeyBundle(userId: any, preKeyBundle: any) {
    let storageBundle = { ...preKeyBundle }
    storageBundle.identityKey = util.arrayBufferToBase64(storageBundle.identityKey)
    storageBundle.preKeys = storageBundle.preKeys.map((preKey: any) => {
      return {
        ...preKey,
        publicKey: util.arrayBufferToBase64(preKey.publicKey)
      }
    })
    storageBundle.signedPreKey.publicKey = util.arrayBufferToBase64(storageBundle.signedPreKey.publicKey)
    storageBundle.signedPreKey.signature = util.arrayBufferToBase64(storageBundle.signedPreKey.signature)
    localStorage.setItem(userId, JSON.stringify(storageBundle))
  }

  updatePreKeyBundle(userId: any, preKeyBundle: any) {
    localStorage.setItem(userId, JSON.stringify(preKeyBundle))
  }
  /**
   * Gets the pre-key bundle for the given user ID.
   * If you want to start a conversation with a user, you need to fetch their pre-key bundle first.
   * 
   * @param userId The ID of the user.
   */
  getPreKeyBundle(userId: any) {
    let preKeyBundle = JSON.parse(localStorage.getItem(userId) as string)
    let preKey = preKeyBundle.preKeys.splice(-1)
    preKey[0].publicKey = util.base64ToArrayBuffer(preKey[0].publicKey)
    this.updatePreKeyBundle(userId, preKeyBundle)
    return {
      identityKey: util.base64ToArrayBuffer(preKeyBundle.identityKey),
      registrationId: preKeyBundle.registrationId,
      signedPreKey: {
        keyId: preKeyBundle.signedPreKey.keyId,
        publicKey: util.base64ToArrayBuffer(preKeyBundle.signedPreKey.publicKey),
        signature: util.base64ToArrayBuffer(preKeyBundle.signedPreKey.signature),
      },
      preKey: preKey[0]
    }
  }
}

/**
 * A signal protocol manager.
 */
class SignalProtocolManager {
  userId: any
  store: SignalProtocolStore
  signalServerStore: SignalServerStore
  constructor(userId: any, signalServerStore: SignalServerStore) {
    this.userId = userId;
    this.store = new SignalProtocolStore();
    this.signalServerStore = signalServerStore;
  }

  /**
   * Initialize the manager when the user logs on.
   */
  async initializeAsync() {
    await this._generateIdentityAsync();

    var preKeyBundle = await this._generatePreKeyBundleAsync();

    this.signalServerStore.registerNewPreKeyBundle(this.userId, preKeyBundle);
  }

  /**
   * Encrypt a message for a given user.
   * 
   * @param remoteUserId The recipient user ID.
   * @param message The message to send.
   */
  async encryptMessageAsync(remoteUserId: any, message: any) {
    var sessionCipher = this.store.loadSessionCipher(remoteUserId);

    if (sessionCipher == null) {
      var address = new libsignal.SignalProtocolAddress(remoteUserId, 123);
      // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
      var sessionBuilder = new libsignal.SessionBuilder(this.store, address);

      var remoteUserPreKey = this.signalServerStore.getPreKeyBundle(remoteUserId);
      // Process a prekey fetched from the server. Returns a promise that resolves
      // once a session is created and saved in the store, or rejects if the
      // identityKey differs from a previously seen identity for this address.
      await sessionBuilder.processPreKey(remoteUserPreKey);

      sessionCipher = new libsignal.SessionCipher(this.store, address);
      this.store.storeSessionCipher(remoteUserId, sessionCipher);
    }

    let cipherText = await sessionCipher.encrypt(util.toArrayBuffer(message) as ArrayBuffer);
    return cipherText
  }

  /**
   * Decrypts a message from a given user.
   * 
   * @param remoteUserId The user ID of the message sender.
   * @param cipherText The encrypted message bundle. (This includes the encrypted message itself and accompanying metadata)
   * @returns The decrypted message string.
   */
  async decryptMessageAsync(remoteUserId: any, cipherText: any) {
    var sessionCipher = this.store.loadSessionCipher(remoteUserId);

    if (sessionCipher == null) {
      var address = new libsignal.SignalProtocolAddress(remoteUserId, 123);
      sessionCipher = new libsignal.SessionCipher(this.store, address);
      this.store.storeSessionCipher(remoteUserId, sessionCipher);
    }

    var messageHasEmbeddedPreKeyBundle = cipherText.type == 3;
    // Decrypt a PreKeyWhisperMessage by first establishing a new session.
    // Returns a promise that resolves when the message is decrypted or
    // rejects if the identityKey differs from a previously seen identity for this address.
    if (messageHasEmbeddedPreKeyBundle) {
      var decryptedMessage = await sessionCipher.decryptPreKeyWhisperMessage(cipherText.body, 'binary');
      return util.toString(decryptedMessage);
    } else {
      // Decrypt a normal message using an existing session
      var decryptedMessage = await sessionCipher.decryptWhisperMessage(cipherText.body, 'binary');
      return util.toString(decryptedMessage);
    }
  }

  /**
   * Generates a new identity for the local user.
   */
  async _generateIdentityAsync() {
    var results = await Promise.all([
      libsignal.KeyHelper.generateIdentityKeyPair(),
      libsignal.KeyHelper.generateRegistrationId(),
    ]);

    this.store.put('identityKey', results[0]);
    this.store.put('registrationId', results[1]);
  }

  /**
   * Generates a new pre-key bundle for the local user.
   * 
   * @returns A pre-key bundle.
   */
  async _generatePreKeyBundleAsync() {
    var result = await Promise.all([
      this.store.getIdentityKeyPair(),
      this.store.getLocalRegistrationId()
    ]);

    let identity = result[0];
    let registrationId = result[1];

    // PLEASE NOTE: I am creating set of 4 pre-keys for demo purpose only.
    // The libsignal-javascript does not provide a counter to generate multiple keys, contrary to the case of JAVA (KeyHelper.java)
    // Therefore you need to set it manually (as per my research)
    var keys = await Promise.all([
      libsignal.KeyHelper.generatePreKey(registrationId + 1),
      libsignal.KeyHelper.generatePreKey(registrationId + 2),
      libsignal.KeyHelper.generatePreKey(registrationId + 3),
      libsignal.KeyHelper.generatePreKey(registrationId + 4),
      libsignal.KeyHelper.generateSignedPreKey(identity, registrationId + 1)
    ]);

    let preKeys = [keys[0], keys[1], keys[2], keys[3]]
    let signedPreKey = keys[4];

    preKeys.forEach(preKey => {
      this.store.storePreKey(preKey.keyId, preKey.keyPair);
    })
    this.store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);

    let publicPreKeys = preKeys.map(preKey => {
      return {
        keyId: preKey.keyId,
        publicKey: preKey.keyPair.pubKey
      }
    })
    return {
      identityKey: identity.pubKey,
      registrationId: registrationId,
      preKeys: publicPreKeys,
      signedPreKey: {
        keyId: signedPreKey.keyId,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature
      }
    };
  }
}

export async function createSignalProtocolManager(userid: any, name: any, dummySignalServer: any) {
  let signalProtocolManagerUser = new SignalProtocolManager(userid, dummySignalServer);
  await Promise.all([
    signalProtocolManagerUser.initializeAsync(),
  ]);
  return signalProtocolManagerUser
}




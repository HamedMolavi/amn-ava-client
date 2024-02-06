// import { PrivateKey } from "@signalapp/libsignal-client";
// //Alice
//   let aliceIKa = PrivateKey.generate()
//   let aliceEKa = PrivateKey.generate()
//   let aliceDHratchet = undefined
//   //Bob
//   let bobIKb = PrivateKey.generate()
//   let bobSPKb = PrivateKey.generate()
//   let bobOPKb = PrivateKey.generate()
//   let bobDHratchet = PrivateKey.generate()

import { KeyHelper, PreKeyType, SessionBuilder, SessionCipher, SignalProtocolAddress, SignedPublicPreKeyType } from "@privacyresearch/libsignal-protocol-typescript";
import { PreKeyBundle } from "@signalapp/libsignal-client";

//Alice
const createID = async (name: string) => {
  const deviceId = 0;

  const registrationId = KeyHelper.generateRegistrationId()
  // storeSomewhereSafe(`registrationID`, registrationId)
  const identityKey = await KeyHelper.generateIdentityKeyPair()
  // storeSomewhereSafe('identityKey', identityKeyPair)

  const preKeyId = 0//makeKeyId()
  const preKey = await KeyHelper.generatePreKey(preKeyId)
  // store.storePreKey(`${baseKeyId}`, preKey.keyPair)

  const signedPreKeyId = 0//makeKeyId()
  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKey, signedPreKeyId)
  // store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair)

  // Now we register this with the server or other directory so all users can see them.
  // You might implement your directory differently, this is not part of the SDK.

  const publicSignedPreKey: SignedPublicPreKeyType = {
    keyId: signedPreKeyId,
    publicKey: signedPreKey.keyPair.pubKey,
    signature: signedPreKey.signature,
  }

  const publicPreKey: PreKeyType = {
    keyId: preKey.keyId,
    publicKey: preKey.keyPair.pubKey,
  }

  const preKeyBundle = PreKeyBundle.new(
    registrationId, deviceId, preKeyId, preKey.keyPair.pubKey, signedPreKeyId, signedPreKey, signedPreKey.signature, identityKey, null, null, null
  )
  //  {
  //   registrationId,
  //   identityPubKey: identityKey.pubKey,
  //   signedPreKey: publicSignedPreKey,
  //   oneTimePreKeys: [publicPreKey],
  // }
}



const starterMessageBytes = Uint8Array.from([
  0xce, 0x93, 0xce, 0xb5, 0xce, 0xb9, 0xce, 0xac, 0x20, 0xcf, 0x83, 0xce, 0xbf, 0xcf, 0x85,
])

const startSessionWithBoris = async () => {
  // get Boris' key bundle. This is a DeviceType<ArrayBuffer>
  const borisBundle = directory.getPreKeyBundle('boris')

  // borisAddress is a SignalProtocolAddress
  const recipientAddress = new SignalProtocolAddress('boris', 1);

  // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
  const sessionBuilder = new SessionBuilder(adiStore, recipientAddress)

  // Process a prekey fetched from the server. Returns a promise that resolves
  // once a session is created and saved in the store, or rejects if the
  // identityKey differs from a previously seen identity for this address.
  await sessionBuilder.processPreKey(borisBundle!)

  // Now we can encrypt a messageto get a MessageType object
  const senderSessionCipher = new SessionCipher(adiStore, recipientAddress)
  const ciphertext = await senderSessionCipher.encrypt(starterMessageBytes.buffer)

  // The message is encrypted, now send it however you like.
  sendMessage('boris', 'adalheid', ciphertext)
}



const address = new SignalProtocolAddress("boris", 1)
const sessionCipher = new SessionCipher(store, address)

// Decrypting a PreKeyWhisperMessage will establish a new session and
// store it in the SignalProtocolStore. It returns a promise that resolves
// when the message is decrypted or rejects if the identityKey differs from
// a previously seen identity for this address.

let plaintext: ArrayBuffer
// ciphertext: MessageType
if (ciphertext.type === 3) {
  // It is a PreKeyWhisperMessage and will establish a session.
  try {
    plaintext = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext.body!, 'binary')
  } catch (e) {
    // handle identity key conflict
  }
} else if (ciphertext.type === 1) {
  // It is a WhisperMessage for an established session.
  plaintext = await sessionCipher.decryptWhisperMessage(ciphertext.body!, 'binary')
}
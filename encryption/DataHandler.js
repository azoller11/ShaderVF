import { NativeModules, Platform } from 'react-native'
import CryptoJS from "crypto-js";
import {decode as atob, encode as btoa} from 'base-64'

var key = CryptoJS.enc.Utf8.parse(convertLettersToNumber("bcdefghijabcdefg"));


var item = "";

var getAES = {
        keySize: 128,
        iv : key, 
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    };

export const decrypt = (data) => {
    try {
        var decryptData = CryptoJS.AES.decrypt(data, key, 
            {
                keySize: 128,
                iv: key,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
            
            );
            var aesde = CryptoJS.enc.Base64.stringify(decryptData);
            var words = CryptoJS.enc.Base64.parse(aesde);
            var textString = CryptoJS.enc.Utf8.stringify(words); // 'Hello world'
        return textString;
    } catch (e) {
        //console.log('Failed to decrypt: ' + e);
        return data;
    }
    
}

export const encrypt = (data) => {
    try {
        var encryptData = CryptoJS.AES.encrypt(data, key, 
            {
                keySize: 128,
                iv: key,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            //console.log("Data: " + decrypt(encryptData));
        return encryptData.toString();
    } catch (e) {
        //console.log('Failed to encrypt: ' + e);
        return data;
    }
    
}


function convertLettersToNumber(str) {
    const mappings = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    return str.split('').map(letter => mappings.indexOf(letter)).join('');
}





import '@testing-library/jest-dom/extend-expect'
import fs from 'fs'
import {uploadFile } from "../aws_util"
import path from "path"

// it("upload file test success", () => {
//   var fileBuffer = fs.readFileSync(path.resolve(__dirname, './BasicTemplate_withDynamicVals.docx'), null);
//   var file = new File(fileBuffer, "BasicTemplate_withDynamicVals.docx", {
//     type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//   });
//   return expect(uploadFile(file, 'docxtemplates')).resolves.not.toThrow();
// });

it("upload file test fail - not provided a file object", () => {
  return expect(uploadFile("", 'docxtemplates')).rejects.toThrow("File input is not of type File");
});

it("upload file test fail - bucket name is not a string type", () => {
  var fileBuffer = fs.readFileSync(path.resolve(__dirname, './BasicTemplate_withDynamicVals.docx'), null);
  var file = new File(fileBuffer, "BasicTemplate_withDynamicVals.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  return expect(uploadFile(file, 3)).rejects.toThrow("Bucket name is not a string");
});

it("upload file test fail - bucket name is null", () => {
  var fileBuffer = fs.readFileSync(path.resolve(__dirname, './BasicTemplate_withDynamicVals.docx'), null);
  var file = new File(fileBuffer, "BasicTemplate_withDynamicVals.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  return expect(uploadFile(file, null)).rejects.toThrow("Bucket name is not a string");
});

it("upload file test fail - bucket name is an empty string", () => {
  var fileBuffer = fs.readFileSync(path.resolve(__dirname, './BasicTemplate_withDynamicVals.docx'), null);
  var file = new File(fileBuffer, "BasicTemplate_withDynamicVals.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  return expect(uploadFile(file, "")).rejects.toThrow("Bucket name cannot be an empty string");
});





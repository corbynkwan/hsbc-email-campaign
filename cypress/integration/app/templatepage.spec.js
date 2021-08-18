/// <reference types="cypress" />

const { ThreeDRotation } = require("@material-ui/icons");
import 'cypress-file-upload';


context("Assertions", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

 describe("Template Tests", () => {

   it('clicking Submit template without name gives error', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      //click ready
      cy.get('#SubmitTemplate')
        .should('be.visible')
        .click();

      cy.contains("At least one field is empty. Please fill in both fields to continue.");
    });

    it('clicking Submit template without file gives error', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      cy.get('#template-name')
        .should('be.visible')
        .type('kaurguvi06@gmail.com');

      //click submit
      cy.get('#SubmitTemplate')
        .should('be.visible')
        .click();

      cy.contains("At least one field is empty. Please fill in both fields to continue.");
    });

    it('clicking Submit template with wrong file gives error', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      // upload template
      cy.fixture('testcypress.csv').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'testcypress.csv',
          mimeType: 'text/csv'
        });
      });

      cy.get('#template-name')
        .should('be.visible')
        .type('testcypress');

      //click submit
      cy.get('#SubmitTemplate')
        .should('be.visible')
        .click();

        cy.wait(50000);


      cy.contains("Wrong template file type. Please upload a .docx file.");
    });

    it('clicking Submit template with file and name generate fails if template name has .docx', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      //enter template name
      cy.get('#template-name')
        .should('be.visible')
        .type('testtemplate.docx');

      // upload template
      cy.fixture('testcypress.docx', 'base64').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'testcypress.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      });

      //click submit
      cy.get('#SubmitTemplate')
        .should('be.visible')
        .click();

      cy.contains("The template name can only contain alpha numeric characters, underscores and/or hyphens");
    });

    it('clicking Submit template with file and name generate success and remove template works', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      const templateName = "testtemplates"+ Math.floor((Math.random() * 10000) + 1);

      //enter template name
      cy.get('#template-name')
        .should('be.visible')
        .type(templateName);

      // upload template
      cy.fixture('testcypress.docx', 'base64').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent: fileContent,
          fileName: 'testcypress'+ Math.floor((Math.random() * 10000) + 1)+'.docx',
          encoding: 'base64',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      });

      //click submit
      cy.get('#SubmitTemplate')
        .should('be.visible')
        .click();

      cy.wait(10000);

      cy.contains("Sucessfully uploaded file");

      //verify grid has template
      cy.get('table').contains('td', templateName);

      cy.get('#dropdownMenuButton').click();
      cy.wait(2000);

      cy.get('#RemoveTemplateDropDown').click();
      cy.wait(2000);
   
      cy.get('#template-nameR')
        .should('be.visible')
        .type(templateName);

        //click remove template
      cy.get('#RemoveTemplate')
      .should('be.visible')
      .click();

      cy.wait(5000);
      //confirm template deleted
      cy.get('table').contains('td', templateName).siblings().contains('td', 'Deactivated');
    });

    it('login success and navigates to testcypress template and display image', () => {

      // login
      cy.get('#email')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.get('#password')
        .should('be.visible')
        .type('teamMailIt!');
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();

      cy.wait(5000);

      //click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(8000);

      cy.get('img[class="img-rounded"]')
      .should('be.visible');

    });
  });
});


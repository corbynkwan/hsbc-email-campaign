/// <reference types="cypress" />

const { ThreeDRotation } = require("@material-ui/icons");
import 'cypress-file-upload';

context("Assertions", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  describe("Send email test", () => {
    it('login success, send email and verify logs are updated', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(50000);

      //single email test
      cy.get('#email-address')
        .should('be.visible')
        .type('gurveer.kaur.aulakh@gmail.com');

      cy.get('#subject-line')
        .should('be.visible')
        .type('EmailSubject');
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentAlert')
        .should('be.visible');

      cy.get('#homepagebutton').scrollIntoView();

      //go to homepage
      cy.get('#homepagebutton')
        .should('be.visible')
        .click();
      cy.wait(50000);

      //open campaign logs
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'View').click();
      cy.contains("Campaign logs: donotremove");
      cy.wait(5000);

      //confirm emails are updated
      cy.get('table').contains('td', "1").siblings().contains('a', 'View').click();
      cy.contains("Email logs");
      cy.wait(50000);

      cy.get('table').contains('td', "gXXXXXXXXXX");
    });

    it('login success, send email and verify logs are updated - batch template', () => {
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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(50000);

      cy.get('#dropdownMenuButton').click();
      cy.wait(2000);

      cy.get('#BatchEmailTemplateDropDown').click();
      cy.wait(2000);

      //upload csv
      cy.fixture('Example_File.csv').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'Example_File.csv',
          mimeType: 'text/csv'
        });
      });

      cy.get('#subject-line-batch-email').scrollIntoView();


      cy.get('#subject-line-batch-email')
        .should('be.visible')
        .type('EmailSubject');

      cy.get('button[id="button2"]')
        .should('be.visible')
        .click();

      cy.wait(15000);

      cy.get('#emailSentAlert').scrollIntoView();


      cy.get('#emailSentAlert')
        .should('be.visible');

      cy.get('#homepagebutton').scrollIntoView();

      //go to homepage
      cy.get('#homepagebutton')
        .should('be.visible')
        .click();
      cy.wait(50000);

      //open campaign logs
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'View').click();
      cy.contains("Campaign logs: donotremove");
      cy.wait(50000);

      //confirm emails are updated
      cy.get('table').contains('td', "1").siblings().contains('a', 'View').click();
      cy.contains("Email logs");
      cy.wait(10000);

      cy.get('table').contains('td', "gXXXXXXXXXX");
      cy.wait(5000);
      cy.get('table').contains('td', "MXXXXXXXXXX");
      cy.wait(5000);
    });

    it('login success and send email fail test with subject line missing', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(5000);

      //single email test
      cy.get('#email-address')
        .should('be.visible')
        .type('gurveer.kaur.aulakh@gmail.com');
      cy.wait(5000);
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentFailed')
        .should('be.visible');

    });
    it('login success and missing email fail test', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(5000);

      //single email test
      cy.get('#subject-line')
      .should('be.visible')
      .type('EmailSubject');
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentFailed')
        .should('be.visible');

    });
    it('login success and white space added with email fail test', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(5000);

      //single email test
      cy.get('#email-address')
        .should('be.visible')
        .type(' gurveer.kaur.aulakh@gmail.com');
      cy.wait(5000);
      cy.get('#subject-line')
      .should('be.visible')
      .type('EmailSubject');
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentFailed')
        .should('be.visible');

    });
    it('login success and incorrectly formatted email fail test', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(5000);

      //single email test
      cy.get('#email-address')
        .should('be.visible')
        .type('gurveer.kaur.aulakh');
      cy.wait(5000);
      cy.get('#subject-line')
      .should('be.visible')
      .type('EmailSubject');
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentFailed')
        .should('be.visible');
    });
    it('login success and not verified email fail test', () => {

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

      cy.wait(10000);

      // click ready
      cy.get('table').contains('td', "donotremove").siblings().contains('a', 'Start').click();
      cy.wait(5000);

      //single email test
      cy.get('#email-address')
        .should('be.visible')
        .type('mountainSasquatch00@gmail.com');
      cy.wait(5000);
      cy.get('#subject-line')
      .should('be.visible')
      .type('EmailSubject');
      cy.get('input[aria-label="name"]')
        .should('be.visible')
        .type('abc');
      cy.get('input[aria-label="AMOUNT"]')
        .should('be.visible')
        .type('2000');
      cy.get('input[aria-label="PROMO_CODE"]')
        .should('be.visible')
        .type('def');
      cy.get('button[id="button1"]')
        .should('be.visible')
        .click();
      cy.wait(5000);
      cy.get('#emailSentFailed')
        .should('be.visible');

    });
  });

});


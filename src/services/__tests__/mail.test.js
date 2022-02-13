const nodemailer = require('nodemailer');
const { sendEmail } = require('../mail');

const spyOnCreateTransport = jest.spyOn(nodemailer, 'createTransport');

afterAll(() => {
  spyOnCreateTransport.mockRestore();
});
describe('sendEmail service function', () => {
  it('should send an email to all selected receivers', async () => {
    const emailOptions = {
      from: 'paying it forward',
      to: 'test1@mail.com, test2@mail.com',
      subject: 'test',
    };
    const sendMailResult = {
      messageId: '<messageId>',
      accepted: ['test1@mail.com, test2@mail.com'],
      rejected: [],
      envelopeTime: 0,
      messageTime: 0,
      response: '250 2.0.0 OK 1575454969 qp 1469',
    };
    spyOnCreateTransport.mockImplementation(() => ({
      sendMail: jest.fn().mockResolvedValue(sendMailResult),
    }));

    const res = await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(spyOnCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.office365.com',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    expect(res).toEqual(sendMailResult);
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
    expect(spyOnCreateTransport);
  });

  it('should throw an error if the there are no recipients', async () => {
    jest.clearAllMocks();
    const emailOptions = {
      from: 'paying it forward',
      subject: '',
      html: '',
    };
    spyOnCreateTransport.mockImplementation(() => ({
      sendMail: jest.fn().mockRejectedValue(new Error('No recipients defined')),
    }));

    const res = await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(res).toEqual(new Error('No recipients defined'));
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
  });

  // NOTE: I think this test is not necessary because invalid emails should be detected when user signs up
  it('should return accepted and rejected emails', async () => {
    jest.clearAllMocks();
    const emailOptions = {
      from: 'paying it forward',
      to: 'rejected@, accepted@gmail.com',
    };
    const sendMailResult = {
      messageId: '<messageId>',
      accepted: ['accepted@gmail.com'],
      rejected: ['rejected@'],
    };
    spyOnCreateTransport.mockImplementation(() => ({
      sendMail: jest.fn().mockResolvedValue(sendMailResult),
    }));

    const res = await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(res.accepted).toEqual(
      expect.arrayContaining(['accepted@gmail.com'])
    );
    expect(res.rejected).toEqual(expect.arrayContaining(['rejected@']));
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
  });
});

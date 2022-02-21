const nodemailer = require('nodemailer');
const { sendEmail } = require('../mail');

const spyOnCreateTransport = jest.spyOn(nodemailer, 'createTransport');

afterAll(() => {
  spyOnCreateTransport.mockRestore();
});
describe('sendEmail service function', () => {
  test('Should send an email to all selected receivers', async () => {
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
    const spyOnSendMail = jest.fn().mockResolvedValue(sendMailResult);
    spyOnCreateTransport.mockReturnValue({
      sendMail: spyOnSendMail,
    });

    const res = await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
    expect(spyOnCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.office365.com',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    expect(spyOnSendMail).toHaveBeenCalled();
    expect(spyOnSendMail).toHaveBeenCalledTimes(1);
    expect(spyOnSendMail).toHaveBeenCalledWith(emailOptions);
    expect(spyOnSendMail).not.toThrow();
    expect(res).toEqual(sendMailResult);
    spyOnSendMail.mockRestore();
  });

  test('Should throw an error if there are no recipients', async () => {
    jest.clearAllMocks();
    const emailOptions = {
      from: 'paying it forward',
      subject: '',
      html: '',
    };
    const spyOnSendMail = jest
      .fn()
      .mockRejectedValue(new Error('No recipients'));
    spyOnCreateTransport.mockReturnValue({
      sendMail: spyOnSendMail,
    });

    await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
    expect(spyOnSendMail).toHaveBeenCalled();
    expect(spyOnSendMail).toHaveBeenCalledWith(emailOptions);
    expect(spyOnSendMail).rejects.toThrow('No recipients');
    spyOnSendMail.mockRestore();
  });

  test('Should return accepted and rejected emails', async () => {
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
    const spyOnSendMail = jest.fn().mockResolvedValue(sendMailResult);
    spyOnCreateTransport.mockReturnValue({
      sendMail: spyOnSendMail,
    });

    const res = await sendEmail(emailOptions);
    expect(spyOnCreateTransport).toHaveBeenCalled();
    expect(spyOnCreateTransport).toHaveBeenCalledTimes(1);
    expect(spyOnCreateTransport).toHaveReturned();
    expect(spyOnSendMail).toHaveBeenCalled();
    expect(spyOnSendMail).toHaveBeenCalledTimes(1);
    expect(spyOnSendMail).toHaveBeenCalledWith(emailOptions);
    expect(spyOnSendMail).not.toThrow();
    expect(res.accepted).toEqual(
      expect.arrayContaining(['accepted@gmail.com'])
    );
    expect(res.rejected).toEqual(expect.arrayContaining(['rejected@']));
    spyOnSendMail.mockRestore();
  });
});

const ball = require('../../util/ball');

describe('ball', () => {
  it('converts number mojo to ball', () => {
    const result = ball.mojo_to_ball(1000000);

    expect(result).toBe(0.000001);
  });
  it('converts string mojo to ball', () => {
    const result = ball.mojo_to_ball('1000000');

    expect(result).toBe(0.000001);
  });
  it('converts number mojo to ball string', () => {
    const result = ball.mojo_to_ball_string(1000000);

    expect(result).toBe('0.000001');
  });
  it('converts string mojo to ball string', () => {
    const result = ball.mojo_to_ball_string('1000000');

    expect(result).toBe('0.000001');
  });
  it('converts number ball to mojo', () => {
    const result = ball.ball_to_mojo(0.000001);

    expect(result).toBe(1000000);
  });
  it('converts string ball to mojo', () => {
    const result = ball.ball_to_mojo('0.000001');

    expect(result).toBe(1000000);
  });
  it('converts number mojo to colouredcoin', () => {
    const result = ball.mojo_to_colouredcoin(1000000);

    expect(result).toBe(1000);
  });
  it('converts string mojo to colouredcoin', () => {
    const result = ball.mojo_to_colouredcoin('1000000');

    expect(result).toBe(1000);
  });
  it('converts number mojo to colouredcoin string', () => {
    const result = ball.mojo_to_colouredcoin_string(1000000);

    expect(result).toBe('1,000');
  });
  it('converts string mojo to colouredcoin string', () => {
    const result = ball.mojo_to_colouredcoin_string('1000000');

    expect(result).toBe('1,000');
  });
  it('converts number colouredcoin to mojo', () => {
    const result = ball.colouredcoin_to_mojo(1000);

    expect(result).toBe(1000000);
  });
  it('converts string colouredcoin to mojo', () => {
    const result = ball.colouredcoin_to_mojo('1000');

    expect(result).toBe(1000000);
  });
});

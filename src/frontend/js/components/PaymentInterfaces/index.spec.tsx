import { render, screen } from '@testing-library/react';
import { handle as mockHandle } from 'utils/errors/handle';
import { RichieContextFactory as mockRichieContextFactory } from 'utils/test/factories/richie';
import { PaymentFactory } from 'utils/test/factories/joanie';
import PaymentInterface from 'components/PaymentInterfaces/index';
import { Payment, PaymentProviders } from 'components/PaymentInterfaces/types';

jest.mock('components/PaymentInterfaces/PayplugLightbox', () => ({
  __esModule: true,
  default: () => 'Payplug lightbox',
}));
jest.mock('components/PaymentInterfaces/LyraPopIn', () => ({
  __esModule: true,
  default: () => 'Lyra Pop-in',
}));
jest.mock('components/PaymentInterfaces/Dummy', () => ({
  __esModule: true,
  default: () => 'Dummy payment component',
}));

jest.mock('utils/errors/handle', () => ({
  handle: jest.fn(),
}));

jest.mock('utils/context', () => ({
  __esModule: true,
  default: mockRichieContextFactory().one(),
}));

describe('PaymentInterface', () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return null and handle an error if payment provider is not implemented', () => {
    // @ts-ignore
    const payment: Payment = PaymentFactory({ provider_name: 'unknown-provider' }).one();

    const { container } = render(
      <PaymentInterface onSuccess={onSuccess} onError={onError} {...payment} />,
    );

    expect(mockHandle).toHaveBeenCalledWith(
      new Error('Payment provider unknown-provider not implemented'),
    );
    expect(onError).toHaveBeenNthCalledWith(1, 'errorDefault');
    expect(container.childElementCount).toEqual(0);
  });

  it('should render the payplug lightbox when provider is Payplug', async () => {
    const payment: Payment = PaymentFactory({
      provider_name: PaymentProviders.PAYPLUG,
    }).one();
    render(<PaymentInterface onSuccess={onSuccess} onError={onError} {...payment} />);

    await screen.findByText('Payplug lightbox');
    expect(onError).not.toHaveBeenCalled();
  });

  it('should render the lyra pop-in when provider is Lyra', async () => {
    const payment: Payment = PaymentFactory({
      provider_name: PaymentProviders.LYRA,
    }).one();
    render(<PaymentInterface onSuccess={onSuccess} onError={onError} {...payment} />);

    await screen.findByText('Lyra Pop-in');
    expect(onError).not.toHaveBeenCalled();
  });

  it('should render the dummy payment component when provider is Dummy', async () => {
    const payment: Payment = PaymentFactory({ provider_name: PaymentProviders.DUMMY }).one();
    render(<PaymentInterface onSuccess={onSuccess} onError={onError} {...payment} />);

    await screen.findByText('Dummy payment component');
    expect(onError).not.toHaveBeenCalled();
  });
});

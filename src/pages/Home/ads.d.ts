/* eslint-disable @typescript-eslint/no-explicit-any */

type AdStatus =
  | 'ad-blocker'
  | 'network-error'
  | 'cors-error'
  | 'no-zoneid'
  | 'ad-started'
  | 'ad-watched'
  | 'ad-interrupted'
  | 'ads-unavailable'
  | 'sys-closing'
  | 'ad-initready'
  | 'ad-rewarded'
  | 'ad-violation'
  | 'ad-maximum'
  | 'ad-rejected';

interface InvokeApplixirVideoUnitOptions {
  zoneId: string | number;
  accountId: string | number;
  userId: string;
  siteId: string | number;
  adStatusCb: (status: AdStatus) => void;
}

declare const invokeApplixirVideoUnit: (
  options: InvokeApplixirVideoUnitOptions
) => void;

declare module 'ads' {
}

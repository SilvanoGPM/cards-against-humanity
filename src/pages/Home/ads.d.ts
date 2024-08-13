/* eslint-disable @typescript-eslint/no-explicit-any */

interface InvokeApplixirVideoUnitOptions {
  zoneId: string | number;
  accountId: string | number;
  userId: string;
  siteId: string | number;
  adStatusCb: (status) => void;
}

declare const invokeApplixirVideoUnit: (options: InvokeApplixirVideoUnitOptions) => void;

declare module 'ads' {
  export = ScrollReveal;
}

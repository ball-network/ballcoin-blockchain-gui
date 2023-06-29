import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './ballLazyBaseQuery';

export { baseQuery };

export default createApi({
  reducerPath: 'ballApi',
  baseQuery,
  endpoints: () => ({}),
});

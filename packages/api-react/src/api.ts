import { createApi } from '@reduxjs/toolkit/query/react';
import ballLazyBaseQuery from './ballLazyBaseQuery';

export const baseQuery = ballLazyBaseQuery({});

export default createApi({
  reducerPath: 'ballApi',
  baseQuery,
  endpoints: () => ({}),
});

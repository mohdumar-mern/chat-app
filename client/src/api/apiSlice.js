// src/redux/api/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1",
    credentials: "include", // ✅ Important: send cookies with every request
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User", "Message"],
  endpoints: (builder) => ({
    // 🔹 Auth Endpoints
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // 🔹 Users
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // 🔹 Messages
    getMessages: builder.query({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation({
      query: ({ conversationId, data }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Message"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetUsersQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = apiSlice;

// ! fix for ReferenceError: TextEncoder is not defined. But it's not working.
// ? https://mswjs.io/docs/faq/ 
export default {
    testEnvironment: 'jest-fixed-jsdom',
}

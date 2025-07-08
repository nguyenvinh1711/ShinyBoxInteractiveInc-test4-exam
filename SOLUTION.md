# Take‑Home Assessment - Exam
    examinee: Nguyen Vinh
    email: nguyenvinh1711@gmail.com

## 🔧 Backend (Node.js) Solutions

1. **Refactor blocking I/O**  
   - `src/routes/items.js` uses `fs.readFileSync`. Replace with non‑blocking async operations.
   - Changed to async/await use below asynchronous functions.
   - Added a new function `fetchDataAsync` to read file asynchronously.
   - References:
    - https://nodejs.org/api/fs.html#fsreadfilefile-options-callback


2. **Performance**  
   - `GET /api/stats` recalculates stats on every request. Cache results, watch file changes, or introduce a smarter strategy.
   - Considerations:
    - readFile, writeFile from fs.promises is not suitable for very large files. Node.js has a limit of ~2GB before throwing a RangeError. In those cases, we can try to use createReadStream, createWriteStream as they process data in chunks, not load whole file into memory.
    - If the data is not changing frequently and quickly, we can cache the results in interval times.
    - Concurrent requests can be handled by a queue. Use Lock when writing to file.
    - If the data is changing frequently, we can introduce a smarter strategy.
   - References:
    - https://betterstack.com/community/guides/scaling-nodejs/joi-vs-zod/
    - https://www.franciscomoretti.com/blog/node-file-writing-methods-createwritestream-vs-writefilesync


3. **Testing**  
   - Added **unit tests** (Jest) for items routes (happy path + error cases).


4. **Solution Considerations & References**
    - Project Architecture: 
        - Mindset: try to keep the codebase clean, reusable, extensible and maintainable.
        - Layered Architecture: https://www.toptal.com/express-js/nodejs-typescript-rest-api-pt-2
        - I think it is a fast, clean and effective structure for a real-world project to easily organize and maintain the codebases afterwards. With large projects, there are two more layers: Service for main business logic and Repository for database operations. We can seperate the layers by each feature for better organization.

    - Error Handling in Express.js 
        - Mindset: propagate the errors to the central error handlers. Try not to let unexpected errors crash the server as much as possible.
        - References:
            - Official Documentation: https://expressjs.com/en/guide/error-handling.html
            - BetterStack: https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/#what-are-errors-in-express-js 
        - Actually I just read and apply this. I think it covered almost all the error-handling cases could happen in a Express.js project.
        
    - Logging with Morgan & Pino:
        - Morgan is primarily an HTTP request logger
        - Pino is high-performance logging framework.
        - I use Pino because it is a more powerful logger than Morgan. It is minimized for production-ready application.
        - We could send error logs to Sentry or other error tracking services to monitor the errors.
        - References:
            - https://expressjs.com/en/resources/middleware/morgan.html
            - https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications

    - Validation with Zod:
        - Mindset: never trust the client, always validate the request data on the server side.
        - I prefer Zod over Joi because 2 things:
            - Validation with unified type inference.
            - Easier to switch to Typescript in more secure Nodejs applications in the long term.
        - References:
            - BetterStack: https://betterstack.com/community/guides/scaling-nodejs/joi-vs-zod/

    - Cache with memoryCache:
        - Mindset: always cache the heavy calculation results to avoid recalculating the stats on every request.
        - I chose watchFile and memoryCache because it is minimal and effective.
            - I don't want to use Redis because it is too complex for a simple project.
            - Chokidar is a reliable choice because it is proven in production environments

        - Large files:
            - As documents from package from fs.promises is not suitable for very large files. Node.js has a limit of ~2GB before throwing a RangeError.
            - If the large data is not changing frequently and quickly, we can cache the stats results in interval times.
            - Concurrent requests can be handled by a queue. Use Lock when writing to file.
            - If the large data is changing frequently, we can leverage Cloud like AWS S3 to store the large data. It has a notification system to notify us when the data is changed (S3 Event Notifications).
            - Ideally in real-world, we use a database like MongoDB, DynamoDB, PostgreSQL, etc. to store the data for a system instead of a file. Then we can use replication or sharding techniques to scale along with the data size.

        - References:   
            - https://www.npmjs.com/package/chokidar

    - Testing:
        - Mindset: test unit first with mockings, then integration tests to make sure modules / layers cooperate properly.
        - I use AAA (Arrange, Act, Assert) pattern to setup tests with Jest.

        - References:
            - https://www.meticulous.ai/blog/mocking-a-javascript-class-with-jest-two-ways-to-make-it-easier#setup-tests-with-jest-using-aaa





## 💻 Frontend (React) Solutions

1. **Memory Leak**  
   - `Items.js` leaks memory if the component unmounts before fetch completes. Fix it.
   - Method 1: As you suggested, we use isMounted Flag
        - While it solves the setState on unmounted component, it doesn't actually cancel the network request, then it still completes, consuming network resources and processing its result, which is then just ignored. 
        - For simple cases it's acceptable, but it's less efficient.
   - Method 2: AbortController to cancel the fetch request when the component unmounts.
        - It's more efficient and clean. Can be encapsulated in a custom hook to reuse later.

        - References:
            - https://blog.openreplay.com/abort-controllers-in-javascript/
            - https://medium.com/@armunhoz/using-abortcontrollers-in-react-hooks-creating-a-hook-for-canceling-pending-requests-39bbcaf01d22


2. **Pagination & Search**  
   - Implement paginated list with server‑side search (`q` param). Contribute to both client and server.
    
    - I write offset pagination with limit, page and search query (q), located at `src/utils/paginator.js`.

3. **Performance**  
   - The list can grow large. Integrate **virtualization** (e.g., `react-window`) to keep UI smooth.
   
   - After some research, I use react-window-infinite-loader which is of the same author as react-window to handle when lists grow large. I also created a 6000 items file to test the component (located in `data/development/items.json`).

   - References:
    - https://www.youtube.com/watch?v=T3b5khnxYQg
    - https://github.com/bvaughn/react-window
    - https://github.com/bvaughn/react-window-infinite-loader

4. **UI/UX Polish**  
   - Feel free to enhance styling, accessibility, and add loading/skeleton states.
   
   - I changed extention from .js to .jsx to standardize React components.
   - Recently, I use Tailwind CSS for styling and Shadcn for UI components.
   - I want to try some new UI libraries then choose DaisyUI with react-daisyui which is a faster way to use DaisyUI with React.

   - References:
        - https://react.daisyui.com/
        - https://www.geeksforgeeks.org/how-to-install-tailwind-css-with-create-react-app/
        - Images: https://www.flaticon.com/
        - SVG Icons: https://opensourcesvgicons.com/akar-icons


5. **Solution Considerations & References**
    - Error Handling: use react-error-boundary package
        - Mindset: rendering components matters, so we should handle errors in rendering components.
        - Errors thrown in event handlers, or after async code has run, will not be caught.
        - References:
            - https://www.youtube.com/watch?v=OQQAv8t3bfc
            - https://www.npmjs.com/package/react-error-boundary

    - Virtualization: react-window
        - react-window to handle large lists.
        - react-window-infinite-loader to handle infinite loading with pagination.
        

    - Testing:
        - Mindset: focus on core aspects:
            - Not concern about the implementation details but component behaves when a user interacts with it.
            - Refactoring will not affect the test results.
        - As highly recommended, I use Jest and react-testing-library to test the components.

        - References:
           - Tutorials: 
                - https://www.wwt.com/blog/using-mock-service-worker-to-improve-jest-unit-tests
                - https://www.meticulous.ai/blog/how-to-use-jest-spyon
                - https://vaskort.medium.com/how-to-unit-test-your-custom-react-hook-with-react-testing-library-and-jest-8bdefafdc8a2
           - Upgrade version to not show deprecation warnings: https://stackoverflow.com/questions/78438525/jest-tells-me-to-use-act-but-then-ide-indicates-it-is-deprecated-what-is-best
           - Testing-library: 
                - https://testing-library.com
                - https://mswjs.io/
                    - I couldn't setup the server.js because of error: ReferenceError: TextEncoder is not defined. I did follow the instructions but no luck.
        

           

# CS125 Project - NutriLife
*Felix Hallmann, Tyler Thiem, Ethan Yim*

Personalized food and dieting recommendations based off of personal context displayed in a simple, straightforward web interface.

## Starting the website E2E

1. If you have not previouslly installed all required dependencies (or need to update them), do so by running `npm install`.

2. After this, run `npm run dev` in the main project directory.

3. To stop the program, exit using ctrl-C in the terminal where you ran the program. 

## Running the frontend

1. If you have not previouslly installed all required dependencies (or need to update them), do so by running `npm install`.

2. After this, run `npm run dev:frontend` in the main project directory.

## Running the basic backend

1. From the root directory, you can run it as `npm run dev:backend`.

2. In a separate terminal change your directory to the src/backend/indexing directory and run 'npm run dev' from there to open the api endpoint. run 'npm install' as well when you first do this as well. Then you should start the frontend. Any changes to the backend you will have to restart it to take effect. 

## Running unittests

Using the jest framework, files with the test.js ending can be ran using npm test in their respective directories. 

## Creating the index

To create the index, run **node src/backend/indexing/buildIndexs.js** from the root directory. 

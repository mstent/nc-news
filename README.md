# Northcoders News API

To run this project locally environment variables are required in order to connect to the relevent postgresql databases.

For the test database an environment variable can be set by creating the file *.env.test* at the top level of the project containing the line `PGDATABASE=nc_news_test`. A similar process is needed for the dev environment with the file *.env.development* created contatining `PGDATABASE=nc_news`.

Run the *setup.sql* file so set up the databases and run the *use-seeds.js* file to seed them.

# Online Code Compiler

## Description
This is a simple online code compiler that supports C++, Python, and JavaScript. It utilizes Docker to execute the code within a secure sandboxed environment.

## Architecture
![Architecture](https://i.imgur.com/HHfvI8f.png)

It has mainly 2 components:
1. [Judger-Server](https://github.com/rohit1kumar/judge-server)- It is a NodeJS server receives code and language input from users, assigns a submission ID, and sends it to the judger-worker. It also handles user requests for code output.

2. [Judger-Worker](https://github.com/rohit1kumar/judge-worker)- It is also a NodeJS server, runs code in a secure sandbox using Docker. It temporarily stores the code and output using Redis.

Here, RabbitMQ serves as a message broker between the Judger-Server and Judger-Worker. By decoupling the components, RabbitMQ enhances scalability and ensures the seamless execution of the requests without blocking the main server, Redis store the temporary data of output of the executed code with submission ID as the key.
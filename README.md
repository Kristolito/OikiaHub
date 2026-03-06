\# RealEstate Platform



A modern full-stack real estate web application built with \*\*React, ASP.NET Core, and MySQL\*\*.



The goal of this project is to build a scalable real estate platform where users can browse properties, search listings, save favorites, and contact agents, while agents and administrators can manage listings through a dashboard.



This project is structured to support \*\*AI-assisted development\*\* using a phased planning approach.



---



\# Project Overview



This platform provides a marketplace for real estate listings.



Users can:



\* Browse available properties

\* Search and filter listings

\* View detailed property pages

\* Save favorite properties

\* Contact agents about properties



Agents can:



\* Create property listings

\* Edit and manage their listings

\* View inquiries from potential buyers or renters



Admins can:



\* Moderate listings

\* Manage users and platform activity



---



\# Tech Stack



\### Frontend



\* React

\* TypeScript

\* Vite

\* TailwindCSS

\* React Router

\* TanStack Query



\### Backend



\* ASP.NET Core Web API (.NET)

\* Entity Framework Core

\* FluentValidation

\* JWT Authentication



\### Database



\* MySQL



\### Architecture



\* Clean Architecture



---



\# Project Structure



The backend follows a \*\*Clean Architecture\*\* structure:



```

src

&nbsp;├── RealEstate.Api

&nbsp;├── RealEstate.Application

&nbsp;├── RealEstate.Domain

&nbsp;└── RealEstate.Infrastructure

```



\*\*RealEstate.Api\*\*



\* Controllers

\* Middleware

\* Authentication configuration



\*\*RealEstate.Application\*\*



\* Business logic

\* DTOs

\* Service interfaces



\*\*RealEstate.Domain\*\*



\* Core entities

\* Enums

\* Domain models



\*\*RealEstate.Infrastructure\*\*



\* EF Core

\* Database configuration

\* External integrations



---



\# AI-Assisted Development Workflow



This repository uses a \*\*phase-based planning system\*\* located in the `/docs` directory.



All planning documents are stored there and define how the application should be built.



```

docs

&nbsp;├── architecture

&nbsp;├── backend

&nbsp;├── frontend

&nbsp;├── database

&nbsp;└── phases

```



Each phase describes a specific part of the system.



Examples include:



\* Project setup

\* Database schema

\* Authentication

\* Property management

\* Search and filtering

\* Favorites

\* Inquiries



---



\# Important Development Rule



The files inside `/docs` are \*\*planning documents\*\*.



They are treated as the source of truth for the project architecture.



These files should \*\*not be modified automatically by development agents or tools\*\*.



---



\# Getting Started



\## Backend



Navigate to the API project and run:



```

dotnet run

```



Swagger will be available for testing the API.



\## Frontend



Navigate to the frontend project and run:



```

npm install

npm run dev

```



The development server will start and the application will be available locally.



---



\# Current Features



\* User authentication

\* Property listings

\* Property search and filtering

\* Favorites system

\* Property inquiries

\* Agent dashboard foundation



---



\# Future Improvements



Planned improvements include:



\* Property image uploads

\* Map-based search

\* Booking property visits

\* Featured listings

\* Notifications and messaging

\* SEO-optimized listing pages



---



\# License



This project is provided for educational and development purposes.




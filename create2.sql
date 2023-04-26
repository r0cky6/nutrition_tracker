CREATE TABLE IF NOT EXISTS "public"."auths" (
	"id" serial NOT NULL PRIMARY KEY,
	"auth_login" text NOT NULL UNIQUE,
	"auth_password" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."users" (
	"id" serial NOT NULL PRIMARY KEY,
	"full_name" varchar(30) NOT NULL DEFAULT 'new user',
	"auth_id" int NOT NULL,
  CONSTRAINT "users_fk1" FOREIGN KEY ("auth_id") REFERENCES "auths"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "public"."categories"(
    "id" serial NOT NULL PRIMARY KEY,
    "category" varchar(40) DEFAULT 'new category'
);

CREATE TABLE IF NOT EXISTS "public"."items"(
    "id" serial NOT NULL PRIMARY KEY,
    "name" varchar(50) DEFAULT 'new item'
);

CREATE TABLE IF NOT EXISTS "public"."recipes"(
    "id" serial NOT NULL PRIMARY KEY,
    "title" varchar(50) DEFAULT 'new recipe',
    "author" int REFERENCES "users"(id),
    "yeald" decimal default 0,
    "unit" varchar(10) DEFAULT 'g'
);
CREATE TABLE IF NOT EXISTS "public"."recipe_category"(
	"id" serial NOT NULL PRIMARY KEY,
	"recipe" int REFERENCES "recipes"(id),
	"category" int REFERENCES "categories"(id)
	);
CREATE TABLE IF NOT EXISTS "public"."ingredients"(
    "id" serial NOT NULL PRIMARY KEY,
    "recipe" int REFERENCES "recipes"(id),
    "item" int REFERENCES "items"(id),
    "amount" varchar(5) DEFAULT 0,
    "unit" varchar(10) DEFAULT 'g',
    "list_position" int NOT NULL DEFAULT 0
);



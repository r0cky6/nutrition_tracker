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

CREATE TABLE IF NOT EXISTS "public"."diets"(
    "id" serial NOT NULL PRIMARY KEY,
    "name" varchar(40),
    "alt" varchar(20),
    "desc" text
);

CREATE TABLE IF NOT EXISTS "public"."cuisines"(
    "id" serial NOT NULL PRIMARY KEY,
    "name" varchar(40),
    "alt" varchar (20),
    "icon" varchar(20)
);

CREATE TABLE IF NOT EXISTS "public"."nutrients"(
    "id" serial NOT NULL PRIMARY KEY,
    "energy" NUMERIC(6,2) DEFAULT 0,
    "carbohydrates" NUMERIC(6,2) DEFAULT 0,
    "protein" NUMERIC(6,2) DEFAULT 0,
    "fiber" NUMERIC(6,2) DEFAULT 0,
    "sugar_total" NUMERIC(6,2) DEFAULT 0,
    "fat_total" NUMERIC(6,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "public"."items"(
    "id" serial NOT NULL PRIMARY KEY,
    "name" varchar(50) DEFAULT 'new item',
    "nutrients" int REFERENCES "nutrients"(id)
);

CREATE TABLE IF NOT EXISTS "public"."recipes"(
    "id" serial NOT NULL PRIMARY KEY,
    "title" varchar(50) DEFAULT 'new recipe',
    "author" int REFERENCES "users"(id),
    "yeald" decimal default 0,
    "unit" varchar(10) DEFAULT 'g'
);
CREATE TABLE IF NOT EXISTS "public"."recipe_cuisine"(
	"id" serial NOT NULL PRIMARY KEY,
	"recipe" int REFERENCES "recipes"(id),
	"cuisine" int REFERENCES "cuisines"(id)
	);
CREATE TABLE IF NOT EXISTS "public"."recipe_diet"(
	"id" serial NOT NULL PRIMARY KEY,
	"recipe" int REFERENCES "recipes"(id),
	"diet" int REFERENCES "diets"(id)
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

CREATE TABLE IF NOT EXISTS "public"."log"(
    "id" serial NOT NULL PRIMARY KEY,
    "date" timestamp NOT NULL DEFAULT NOW(),
    "recipe" int REFERENCES "recipes"(id)
);

CREATE TABLE IF NOT EXISTS "public"."pantry"(
    "id" serial NOT NULL PRIMARY KEY,
    "item" int REFERENCES "items"(id),
    "exp" timestamp,
    "amount" int DEFAULT 0,
    "unit" varchar(10) DEFAULT 'g'
);

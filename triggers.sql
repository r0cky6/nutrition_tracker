CREATE OR REPLACE FUNCTION beforeAuthInsert() RETURNS TRIGGER AS $$
   BEGIN
      NEW.auth_password = crypt(NEW.auth_password, gen_salt('bf'));
      RETURN NEW;
   END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER beforeAuthInsert BEFORE INSERT ON public.auths
FOR EACH ROW EXECUTE PROCEDURE beforeAuthInsert();

CREATE OR REPLACE FUNCTION afterAuthInsert() RETURNS TRIGGER AS $$
   BEGIN
      INSERT INTO public.users (auth_id) values (NEW.id);
      RETURN NEW;
   END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER afterAuthInsert AFTER INSERT ON public.auths
FOR EACH ROW EXECUTE PROCEDURE afterAuthInsert();

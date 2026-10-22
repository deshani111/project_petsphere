-- A phone number identifies one PetSphere account, just as an email address does.
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

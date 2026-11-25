try:
    password = input("Enter the password: ")

    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")

    if not password.isalpha():    #isaplpha makes sure that the password will be characters only this is inbulit func of py
        raise ValueError("Password must contain letters only.")

    print("Valid Password")

except ValueError as e:
    print(e)
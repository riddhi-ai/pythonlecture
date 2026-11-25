#else and finally together
try:
    num= int(input("enter the nunber"))
    result = 50/ num

except ZeroDivisionError:
    print("Cannot divide by zero")
except ValueError:
    print("Use Integer only")
else:
    print("Result:",result)
finally: 
    print("Thankyou for using the program")
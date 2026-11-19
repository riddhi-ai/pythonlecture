try:
    num= int (input("Enter Number:"))
    print(100/num)
except ZeroDivisionError:
    print("Division by Zero")
except ValueError:
    print("Invalid Input")
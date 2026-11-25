#one block for multiple exceptions
try:
    num= int (input("Enter Number:"))
    result= (100/num)
    print(result)

except (ValueError,ZeroDivisionError):
    print("Invalid Operation")
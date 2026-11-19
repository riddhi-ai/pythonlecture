#using else block
try:
    num= int (input("Enter Number:"))
    result= (100/num)
except ZeroDivisionError:
    print("Division by Zero")
else:
    print("result", result)
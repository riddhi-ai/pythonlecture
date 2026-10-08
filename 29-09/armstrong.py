#Armstrong No
num = int(input("Enter the num: "))
n = num
digits = len(str(num))
sum = 0

while n > 0:
    digit = n % 10
    sum += digit ** digits
    n //= 10

if sum == num:
    print("This is an Armstrong Number")
else:
    print("Not an Armstrong Number")

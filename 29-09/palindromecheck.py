

num = int(input("Enter the num: "))
sum = num   
n = 0        

while num > 0:
    n = n * 10 + (num % 10)
    num = num // 10

if sum == n:
    print("Number is palindrome")
else :
    print("Number is not palindrome")


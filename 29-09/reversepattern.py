n = int(input("Enter the number of rows: "))

for i in range(n, 0, -1):          # outer starts from n down to 1 value of i is 5
    for j in range(i, 0, -1):      
        print(j, end=" ")
    print()

n = int(input("Enter the size: "))

for i in range(1, n + 1):                 # loop through rows
    for j in range(1, n + 1):             # loop through columns
        if i == (n // 2 + 1) or j == (n // 2 + 1):
            print("*", end=" ")
        else:
            print(" ", end=" ")
    print()

n = int(input("Enter the number of rows: "))

for i in range(1, n + 1):                 # outer loop → controls rows
    print(" " * (n - i), end="")           # print spaces before stars
    print("* " * i)                        # print stars for that row

import asyncio

async def func1():
    print("Function 1 started...")
    await asyncio.sleep(2)
    print("Function 1 ended.")

async def func2():
    print("Function 2 started...")
    await asyncio.sleep(3)
    print("Function 2 ended.")

async def func3():
    print("Function 3 started...")
    await asyncio.sleep(1)
    print("Function 3 ended.")

async def main():
    await asyncio.gather(func1(), func2(), func3())
    print("Main ended.")

asyncio.run(main())  # In a .py file, replace this line with asyncio.run(main())
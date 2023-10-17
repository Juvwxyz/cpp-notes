---
html:
  offline: true

export_on_save:
  html: true
---

# `if`语句详解 

<h2 style="font-family:'Cascadia Code';font-weight:300;font-style:italic;">
<span class="token keyword control">if</span> (<span class="token function">strcmp</span>(language, <span class="token string">"C"</span>))
</h2>

- ### 完整语法

`if`语句是C/C++中非常常见的语句，它的效果是根据条件选择其中一个分支执行。我们先来复习一下C语言中的`if`语句的完整语法：

> `if (`*`条件表达式`*`)`*`真-分支语句`*
> `if (`*`条件表达式`*`)`*`真-分支语句`*`else`*`假-分支语句`*

- ### 条件与分支

在C语言中，`if`括号内的条件必须是一个标量类型的表达式。标量类型包括以下类型：

- 字符类型 `char` `signed char` `unsigned char`
- 整数类型 `short` `int` `long` `long long`以及它们对应无符号版本
- 枚举类型 `enum`
- 浮点类型 `float` `double` `long double`以及它们对应的复数和虚数版本
- 指针类型

简而言之，只要表达式的类型能够与`0`进行相等性比较即可：当表达式的结果不等于`0`，就执行`真-分支语句`；否则，若存在`假-分支语句`，就执行`假-分支语句`。

```c
if (expr) // 等价于 if (expr != 0)
    true_branch
else
    false_branch
```

`if`的两个分支必须是单条语句，最常见的做法当然是复合语句——将多条语句用花括号括起来，它们只算一条语句。

```c
// 常见易错点：
if (condition)
    statement 1;
    statement 2; // 这条语句不受if控制
else
    statement 3; // else分支无法与前面的if匹配

if (condition)
    statement 1;
    statement 2; // 这条语句不是if的一部分

if (condition) ; // 多写了一个分号，相当于跟了一条空语句
    statement 1; // 这条语句不受if控制
    statement 2; // 这条语句也不受if控制
```

- ### `if`的作用域

从C99开始，`if`语句会建立一个作用域，在条件表达式中引入的名字可以在两个分支中访问，但离开`if`作用域就不再能访问了。并且，它的两个分支语句即使不是复合语句，也会将它当作如同复合语句一样建立一个局部作用域。

当然，由于条件必须是表达式，而C语言很难在表达式中引入新的名字，所以这一点其实很难体现出来，也就很少有人注意到。而且大多数情况下，`if`的分支都是复合语句，它们本来就会建立作用域。

```c
#include <stdio.h>

/* 第一个a，全局作用域 */
enum {a = 1};

int main(void)
{
    /* 第二个a，if-作用域 */
    if (sizeof(enum {a = 2}))
        /* 第三个a，真分支局部作用域 */
        printf("a = %d\n", (sizeof(enum{a = 3}), a));
    else
        /* 第四个a，假分支局部作用域 */
        printf("a = %d\n", (sizeof(enum{a = 4}), a));

    /* 打印a = 1 */
    printf("a = %d\n", a);
    return 0;
}
```

- ### 其他特性

在嵌套的`if`语句中，`else`总是与离他最近的未配对的`if`匹配。为了避免歧义，即使`if`的分支仅需一条表达式语句，也建议用花括号括起来。另外，善用编辑器的自动格式化功能，`if`各分支的缩进也能提示你它们是如何配对的。

```c
#include <stdio.h>
int main() {
    if (0)
        if (0)
            puts("1");
    else
        puts("2");
    puts("3");
}
```

另外，`if - else if`也是常见的用法，它并不是什么特殊的语法，只是在外层`if`语句的`else`分支又嵌套了另一个if语句。

```c
int a; scanf("%d", &a);

if (a == 1)
    puts("a == 1");
else if (a == 2)
    puts("a == 2")
else
    puts("others");

if (a == 1) {
    puts("a == 1");
} else {
    if (a == 2) {
        puts("a == 2")
    }
    else {
        puts("others");
    }
} 
```

最后，只要程序进入了`真分支`，不论是条件为真，还是你用`goto`语句跳过`if`的条件判断直接进入`真分支`，`假分支`都不会执行，执行完`真分支`总是会跳过`假分支`。

```c
goto true_branch;
if (0) {
true_branch:
    printf("true branch\n");
} else {
    printf("false branch\n");
}
```

思考题：请问在C89和C99中，下列代码分别输出什么？（答案见文末）

```c
#include <stdio.h>
int a = 0;
int main(void)
{
    if (1) int a = 1;

    printf("%d\n", a);

    return 0;
}
```

<h2 style="font-family:'Cascadia Code';font-weight:300;font-style:italic;">
<span class="token keyword control">if</span> (language == <span class="token string">"C++"s</span>)
</h2>

- ### `extern "C"`

C++兼容99%的C语言`if`语义，并在此基础上进行了扩展。

> `if (`*`条件`*`)`*`真-分支语句`*
> `if (`*`条件`*`)`*`真-分支语句`*`else`*`假-分支语句`*

先来看看`条件`的部分。C++从一开始就有`bool`类型，因此在`if`中也不再是将条件表达式与`0`进行比较，而是将结果隐式转换为`bool`。如果转换的结果是`true`，则执行`真-分支语句`；如果转换的结果是`false`，则执行`假-分支语句`。

由于`if`的条件期待一个`bool`值，这里的隐式转换也称为`按语境转换`。这是一种特殊的隐式转换，它与普通的隐式转换最大的区别在于它可以调用用户定义的`explicit`转换函数。当然，对于内置类型来说，C和C++的`if`行为完全一致——非`0`值隐式转换为`true`，`0`隐式转换为`false`。

```cpp
struct Flag {
    bool flag;
    explicit operator bool() const {
        return this->flag;
    }
};

int main() {
    Flag f{};
    // OK，按语境转换考虑explict转换函数
    if (f) { /*****/ }
    // Error，隐式转换不考虑explict转换函数
    bool b1 = f;
    // OK，显式类型转换
    bool b2 = bool(f);
}
```

重载`operator bool`也是相当常见的做法，例如`std::istream`。它转换到`bool`的结果表示上一次读取操作是否成功，成功则为`true`，失败则为`false`。当然，这只是一个笼统的结果，如果想知道具体造成失败的原因，还是要查看`std::istream`的各个标志位。

```cpp
#include <iostream>
int main() {
    int a = 42;
    if (std::cin >> a)
        std::cout << "Ok, a = " << a << '\n';
    else
        std::cout << "Failed, a = " << a << '\n';
}
```

- ### 条件，但是简单声明

然后，语法中只说了它是个`条件`，但并未强调表达式。在C++中，条件可以是一条简单声明。这里的简单声明有如下限制：它只能声明单个非数组变量，并且必须初始化。这样的`if`语句将根据该变量的初始值执行相应的分支。

```cpp
#include <iostream>
using std::cin;
int main() {
    char buf[64];
    if (int c = cin.read(buf, 63).gcount()) {
        buf[c] = 0;
        printf("read %d char from stdin:\n%s\n", c, buf);
    }
    else {
        buf[c] = 0;
        printf("read %d char from stdin.\n", c);
    }
}
```

可以在条件中定义变量，`if`自身建立的作用域的效果也更加明显了。C++的`if`语句建立的作用域与C语言的稍有区别。C语言会建立一个`if`自身的作用域，在条件表达式中定义的名字会被分支语句中相同的名字隐藏；但C++不会引入这么一个额外的作用域，它的作用域是其两个分支作用域的和。条件中定义的新名字仍然可以在两个分支中访问，但分支中再定义相同的名字会导致编译错误。

```cpp
#include <cstdio>

// 第一个a，全局作用域
int a = 1;

int main(void)
{
    // 第二个a，if-作用域
    if (int a = 2)
        // OK，打印a = 2
        printf("a = %d\n", a);
    else {
        // Error，a重定义。
        int a = 3;
        printf("a = %d\n", a);
    }
}
```

## C++17：史诗级更新

C++17开始，`if`的功能获得了极大的扩展。

> `if constexprₒₚₜ (`*`初始化语句ₒₚₜ 条件`*`)`*`真-分支语句`*
> `if constexprₒₚₜ (`*`初始化语句ₒₚₜ 条件`*`)`*`真-分支语句`*`else`*`假-分支语句`*

如果你觉得条件中只能声明单个非数组变量限制太大，那么你现在可以在条件前面加一条`初始化语句`。它可以是一条表达式语句，简单声明，或者从C++23开始还可一是`using`声明。表达式语句可以让你在判断之前执行一些初始化操作，而简单声明则可以定义变量、结构化绑定、甚至`typedef`。

```cpp
#include <iostream>
using std::cin;
int main() {
    if (char buf[64]; int c = cin.read(buf, 63).gcount()) {
        buf[c] = 0;
        printf("read %d char from stdin:\n%s\n", c, buf);
    }
    else {
        buf[c] = 0;
        printf("read %d char from stdin.\n", c);
    }
}
```
```cpp
#include <cstdio>
#include <map>

void insert(std::map<int,int>& map, int k, int v) {
    if (auto[item,ok] = map.insert({k,v}); ok) {
        auto [k, v] = *item;
        printf("new item: {%d:%d}\n", k, v);
    }
    else {
        auto [k, v] = *item;
        printf("key exsisted: {%d:%d}\n", k, v);
    }
}

int main() {
    auto map = std::map<int, int>{};
    insert(map, 0, 0);
    insert(map, 0, 1);
}
```

除了`初始化语句`，C++17的另一项重要更新是 constexpr if。如前文所示，在`if`和括号之间加上一个`constexpr`关键字的形式叫做 constexpr if 语句。

constexpr if 语句的条件必须是一个常量表达式。如果求值为`true`，则舍弃`假分支语句`；反之求值为`false`，则舍弃`真分支语句`。

如果被舍弃的分支包含`return`语句，那么它们不会参与函数返回类型的推导。

```cpp
template<typename T>
auto get_value(T t)
{
    if constexpr (std::is_pointer_v<T>)
        return *t; // 对 T = int* 推导返回类型为 int
    else
        return t;  // 对 T = int 推导返回类型为 int
}
```

被舍弃语句可以 ODR 使用未定义的变量，但仍然至少要有声明。

```cpp
extern int x;
 
int f()
{
    if constexpr (true)
        return 0;
    else if (x)
        return x;
    else
        return -x;
}
```

利用这一特性，你可以用 constexpr if 来让不符合要求的模板引发静态断言。

```cpp
template <class T>
void f(T t) {
    if constexpr (sizeof(T) == sizeof(int)) {
        use(t);
    } else {
        static_assert(false, "must be int-sized");
    }
}

void g(char c) {
    f(0); // OK
    f(c); // error: must be int-sized
}
```

被舍弃的语句仍然会经历完整语法检查，除了上述情况，其他违反语法规定的情况都会导致编译错误。所以 constexpr if 不是`#if`预处理器的的替代品，虽然它们在特定的场景能做到相同的效果。

## C++23：常量求值语境补完计划

C++23又引入了consteval if 语句，它的语法规则如下。

> `if !ₒₚₜ consteval`*`复合语句1`*
> `if !ₒₚₜ consteval`*`复合语句1`*`else`*`复合语句2`*

它的效果是：对于不带逻辑非运算符的版本，在明显常量求值语境中执行`复合语句1`；否则，如果有`else`分支，则执行`复合语句2`。对于带逻辑非运算符的版本，在非明显常量求值语境中执行`复合语句1`；否则，如果有else分支，则执行`复合语句2`。并且，在常量求值语境执行的分支是立即函数语境，即`if consteval`的`复合语句1`或者`if !consteval`的`复合语句2`。

```cpp
#include<cstdio>

constexpr int foo() {
    if consteval {
        return 42;
    } else {
        return 114;
    }
}
int main() {
    static_assert(foo() == 42);
    char str[foo()];
    switch (sizeof(str)) {
    case foo():
        printf("%zu\n", sizeof str);
        break;
    }
    printf("%d\n", foo());
}
```

那么重点就是这个`明显常量求值语境`，什么是`明显常量求值语境`呢？简单来说就是语法上要求常量表达式的地方。例如数组的长度、`case`标签后面的表达式、模板的非类型模板实参、上面提到的 constexpr if 的条件等，还有一些`明显常量求值语境`大家可以自行查阅相关文档，这里就不赘述了。

这个特性主要是为了补完`std::is_constant_evaluated()`的一些缺陷。例如它并不能让普通`if`的分支变成立即函数语境：

```cpp
consteval int f(int i) { return i; }

constexpr int g1(int i) {
    if (std::is_constant_evaluated()) {
        // Error，此处不是立即函数语境，不能调用f(i)
        return f(i) + 1;
    } else {
        return 42;
    }
}
constexpr int g2(int i) {
    if consteval {
        // OK，此处是立即函数语境
        return f(i) + 1;
    } else {
        return 42;
    }
}
```

再例如，它和constexpr if一起使用会造成意想不到的错误。刚才提到，constexpr if的条件是`明显常量求值语境`，因此`std::is_constant_evaluated()`会永远返回`true`。

```cpp
constexpr bool f() {
    // this function will always return true
    if constexpr (std::is_constant_evaluated())
        return true;
    else
        return false;
}
```

## `if`的替代品

- ### 条件表达式

> `condition ? expr1 : expr2`

条件运算符也经常被称为三元运算符或三目运算符，因为它有三个操作数。与`if`类似，它也是根据条件表达式的求值结果来选择一个表达式求值。如果条件求值为`true`，则求值第一个表达式`expr1`；否则，求值第二个表达式`expr2`。它和`if`最大的区别在于，`if`是语句，而条件表达式是表达式。

```cpp
bool condition;
int a, b;
// 在必须使用表达式的语境，if作为语句的性质就不方便了。
int &ref = condition ? a : b;
```

- ### Lambda / 函数

当然，用函数将`if`包裹起来也能做到将`if`语句转化为表达式：

```cpp
int& max(int& a, int& b) {
    if (a >= b)
        return a;
    else
        return b;
}
```

而C++11引入的lambda表达式则更加方便。这当然只是个简单的例子，如果需要进行复制的判断，那么lambda的优势就显现出来了。

```cpp
bool condition;
int a, b;

int &ref = [&]()->int& {
    if (condition)
        return a;
    else
        return b;
    }();
```

- ### 逻辑短路

另一个替代`if`的奇技淫巧是利用逻辑运算符的短路性质。称之为奇技淫巧并不为过，因为它不太直观，滥用会导致代码难以理解。一个比较常用的地方是利用这一性质避免解引用空指针。

```cpp
struct node {
    int data;
    node* next;
};
void find(node *p, int target) {
    while(p && p->data != target)
        p = p->next;
    return p;
}
void find(node *p, int target) {
    while (true) {
        if (p) {
            if (p->data != target)
                continue;
            else
                break;
        }
        else {
            break;
        }
        p = p->next;
    }
    return p;
}
```

- ### 分支消除

有时候，通过一些数学运算可以完全消除掉`if`语句，例如下面的例子，计算一个有符号整数的绝对值。将一个`32`位的有符号整数右移31位，如果它是正数，那肯定得到`0`；如果它是负数，肯定能得到`-1`。于是将这个结果乘以`2`加上`1`，整数得到`1`，负数得到`-1`，乘以自身就能取得它的绝对值。这个技巧也不是很推荐你使用，首要原因当然是它不直观。其次很多人认为消除`if`可以带来性能提升，这实际上是一种误解。在现代CPU的分支预测的加持下，`if`的性能比下面这段复杂的运算更快是很正常的事情。当然，一切都以实际的性能测试为准，没有测试的提前优化是万恶之源。

```cpp
int32_t abs(int32_t a) {
    return a * ((a >> 31) * 2 + 1);
}
```



## 参考资料

- [cppreference C - if 语句](https://zh.cppreference.com/w/c/language/if)
- [cppreference C++ - if 语句](https://zh.cppreference.com/w/cpp/language/if)
- [P1938R3 - consteval if](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2021/p1938r3.html)

## 附：
> 思考题答案是编译错误。C语言`if`的分支必须是“语句”，而C语言中声明不属于语句。C++有声明语句，允许这种代码（虽然没啥意义），并且会输出`0`。

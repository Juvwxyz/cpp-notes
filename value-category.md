---
html:
  offline: true
export_on_save:
  html: true
---

# 值类别

值类别（value category）是C++中一个非常重要的概念。很多其他概念都与值类别相关，例如左值引用、右值引用、移动语义等。今天，我就带大家来了解一下，什么是值类别，以及C++为什么要有值类别。

## 一、从赋值运算符的左边说起

首先，来看看这段平平无奇的代码：

```cpp
int c;
c = 0; // OK
0 = c; // Error
```

你每天都会写赋值表达式，但是你是否想过一个问题：`c = 0`没问题，为什么`0 = c`就不行？你可能会觉得这不是理所当然吗？`0`是一个字面量，当然不能赋值。可是赋值运算符左边是个表达式，右边也是表达式，它们究竟有什么不同呢？

再比如下面的例子：

```cpp
c++; // OK
++0; // Error

int *p;
p = &c;     // OK
p = &0;     // Error
*p = 1 + 1; // OK
1 + 1 = *p; // Error
p[0] += 42; // OK
42 += p[0]; // Error

int& r1 = *p;  // OK
int& r2 = +c; // Error
```

## 二、给表达式分类

通过上面那些例子，我们不难发现，在某些语境里，要求表达式指代内存中的某个对象。例如`c = 0`中，我们并不关心表达式`c`具体的值是多少，而是关心它指代的那个对象，以便将右侧表达式的结果写入这个对象。

这一概念最早来自CPL语言。CPL语言对表达式的求值有两种模式：右侧模式（right-hand mode）和左侧模式（left-hand mode）。右侧模式求值就是我们通常意义上对表达式的求值：执行一些计算，然后得到计算的结果。而左侧模式求值的结果是一个地址。赋值就是将右侧表达式求值的结果写入左侧表达式的地址。这就是左值和右值这两个名字的来源。

C语言继承了类似的分类方法，将表达式分为`左值`（`lvalue`）和`非左值`。其中，标识了内存中对象的表达式就是`左值`。由于C语言并没有将函数类型的表达式划入`左值`的范畴，与`左值`相对的值类别被统称为`非左值`而并没有沿用右值的叫法。

C语言的值类别系统相较于CPL已经有了很大的变化，最为显著的就是并非所有的左值都能出现在赋值运算符的左侧。例如`const`限定的对象，或者数组。因此C语言更倾向于将`lvalue`中的`l`解释为`locator`，即`定位器值`(`loactor value`)。

```c
// Error，i有const限定，不能修改
const int i = 0;
i = 42;

// Error，数组是左值，但不能出现在赋值运算符左侧
char str[] = "Hello world.";
str = "Hello again.";
```

C++98正式出版时，基本沿用了C语言的值类别模型，但具体的细节做了很多修改。首先是恢复了对非左值表达式`右值`（`rvalue`）的称呼，并将函数划分到左值的范畴，然后将C语言几种非左值表达式也划入了左值。此外，C++引入了`引用`的概念，引用只能绑定到左值，但是`const`限定的引用却可以绑定到右值。

为了支持移动语义，C++11对值类别进行了重新定义，并引入了`亡值`这一新概念，形成了`左值`、`亡值`、`纯右值`三大基本值类别和`泛左值`、`右值`两种复合值类别。C++17 中，某些场合强制要求进行复制消除，而这要求将纯右值表达式从被它们所初始化的临时对象中分离出来，这就是我们现有的值类别系统：

- 泛左值（glvalue）

  即泛化的左值（**g**eneralized **lvalue**）。是其值可确定某个对象或函数的表达式。

- 左值（lvalue），是非亡值的泛左值，它的资源不能被重新使用，或者说它不可移动；

- 亡值（xvalue），即将亡的值（e**x**piring l**value**）。是代表它的资源能够被重新使用，或者说它是可移动的对象或位域的泛左值；

- 纯右值（prvalue），即纯的右值（**p**ure **rvalue**）。是求值符合下列之一的表达式：

  - 计算某个运算符的操作数的值，这种纯右值没有结果对象

  - 初始化某个对象，这种纯右值有一个结果对象

- 右值（rvalue），是纯右值或者亡值。

<div><svg style="width:100%" width="556pt" height="274pt" viewBox="0.00 0.00 278.00 137.00"><g class="graph" transform="scale(1 1) rotate(0) translate(4 133)"><g class="node"><text text-anchor="middle" x="135" y="-117" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">表达式</text></g><g class="node"><text text-anchor="middle" x="81" y="-62" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">泛左值</text></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M126.08,-109.75C118.22,-102.03 106.57,-90.6 97.08,-81.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="99.34,-78.6 89.75,-74.09 94.44,-83.59 99.34,-78.6"></polygon></g><g class="node"><text text-anchor="middle" x="189" y="-62" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">右值</text></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M143.92,-109.75C151.78,-102.03 163.43,-90.6 172.92,-81.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="175.56,-83.59 180.25,-74.09 170.66,-78.6 175.56,-83.59"></polygon></g><g class="node"><text text-anchor="middle" x="27" y="-7" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">左值</text></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M72.08,-54.75C64.22,-47.03 52.57,-35.6 43.08,-26.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="45.34,-23.6 35.75,-19.09 40.44,-28.59 45.34,-23.6"></polygon></g><g class="node"><text text-anchor="middle" x="135" y="-7" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">亡值</text></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M89.92,-54.75C97.78,-47.03 109.43,-35.6 118.92,-26.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="121.56,-28.59 126.25,-19.09 116.66,-23.6 121.56,-28.59"></polygon></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M180.08,-54.75C172.22,-47.03 160.57,-35.6 151.08,-26.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="153.34,-23.6 143.75,-19.09 148.44,-28.59 153.34,-23.6"></polygon></g><g class="node"><text text-anchor="middle" x="243" y="-7" font-family="汉仪玄宋" font-size="10.00" fill="#dcdcdc">纯右值</text></g><g class="edge"><path fill="#dcdcdc" stroke="#dcdcdc" d="M197.92,-54.75C205.78,-47.03 217.43,-35.6 226.92,-26.28"></path><polygon fill="#dcdcdc" stroke="#dcdcdc" points="229.56,-28.59 234.25,-19.09 224.66,-23.6 229.56,-28.59"></polygon></g></g></svg></div>

### 2.1 `decltype`检查值类别

下面列举了各种表达式的值类别，但是情况复杂，死记硬背是不明智的。好在C++为我们提供了检查值类别的直接手段，那就是`decltype`说明符。它可以用来检查实体的声明类型，或者表达式的类型和值类别。

> `decltype ( 实体 )`
> `decltype ( 表达式 )`

`decltype`说明符有两种用法。第一种，括号里的实参是一个不带括号的标识表达式，它产生该表达式所指代实体的声明类型。标识表达式包括变量名、对象成员访问表达式`a.m`、指针成员访问表达式`p->m`。

```cpp
int   a = 42;
int&  b = a;
int&& c = 0
decltype(a) i = a; // int
decltype(b) j = a; // int&
decltype(c) k = 0; // int&&
```

今天主要介绍第二种用法，对于其他形式的表达式，假设其类型是`T`：

- 如果表达式的值类别是纯右值，那么`decltype`产生`T`；

- 如果表达式的值类别是左值，那么`decltype`产生`T&`；

- 如果表达式的值类别是亡值，那么`decltype`产生`T&&`；

特别要注意，如果标识表达式外层有括号，那么会按照第二种情况处理。

```cpp
decltype((a)) i = a; // int&
decltype((b)) j = a; // int&
decltype((c)) k = a; // int&
```

根据这一性质，我们可以写一个宏来打印表达式的值类别：

```cpp
#define value_category_of(expr)                     \
  (std::is_lvalue_reference_v<decltype((expr))> ?   \
    puts("( "#expr" ) -> lvalue") :                 \
   std::is_rvalue_reference_v<decltype((expr))> ?   \
    puts("( "#expr" ) -> xvalue")                   \
  :                                                 \
    puts("( "#expr" ) -> prvalue"))
```

### 2.2 左值（lvalue）

刚才我们已经见过左值表达式了，它们可以指代内存中的对象。既然是内存中的对象，那它就可以取地址，或者绑定到左值引用：`auto p = &(expr)`&#8203;`auto &r = (expr)`。考虑到取地址运算符可能被重载，检查表达式能否绑定到左值引用是一个相当靠谱的办法。当然凡事都有例外：如果表达式指代某个位域成员，那么它就不能取地址，也不能绑定到左值引用。

下列表达式是左值表达式：

- 字符串字面量；

  ```cpp
  auto *p1 = &"Hello world."; // const char (*)[13]
  auto &p2 = "Hello world.";  // const char (&)[13]
  value_category_of("Hello world.");
  ```

- 名字表达式。对象、引用、函数、数据成员、结构化绑定、模板形参对象的名字构成的表达式是左值表达式。即使是右值引用也如此，由它的名字构成的表达式仍然是左值。

  ```cpp
  #include <iostream>

  struct A { int a; };

  template<A a>
  void foo() {
    // a是模板形参对象
    value_category_of(a);
  }

  int main() {
    value_category_of(std::cin);

    //OK，绑定引用到函数。
    std::ostream& (&b)(std::ostream&) = std::endl;

    foo<A{2}>();

    int &&rref = 42;
    // 右值引用的名字构成的表达式是左值
    value_category_of(rref);
  }
  ```

- 内建的赋值表达式`a = b`、复合赋值表达式`a+=b`&#8203;`a-=b`&#8203;`a*=b`&#8203;`a/=b`&#8203;`a%=b`&#8203;`a&=b`&#8203;`a|=b`&#8203;`a^=b`&#8203;`a<<=b`&#8203;`a>>=b`、前缀自增/自减表达式`++i`&#8203;`--i`、间接寻址表达式`*p`。

  ```cpp
  int a = 0, *p = &a;
  value_category_of(a = 42);
  value_category_of(a += 42);
  value_category_of(++a);
  value_category_of(*p);
  ```

- 内建的下标表达式`a[n]`，其中一个操作数是数组左值或指针。

  ```cpp
  int a[2] {}, *p = a;
  value_category_of(p[0]);
  value_category_of(a[1]);
  ```

- 成员访问表达式`a.m`&#8203;`p->m`&#8203;`a.*mp`&#8203;`p->*mp`中，`m`是静态数据成员或静态成员函数；或者`a`是左值并且`m`是非静态数据成员的情况。后三种形式可算作第一种的特殊形式，关于成员访问表达式的详细分类方式可参见后文的[表格](#27-成员访问表达式)。

  ```cpp
  struct A {
    int a;
    static void foo() {}
  } a;
  int main() {
    value_category_of(a.a);
    value_category_of(a.foo);
  }
  ```

- 转换到左值引用的转型表达式、返回类型为左值引用的函数调用表达式，其中也包括重载的运算符。

  ```cpp
  #include <iostream>
  #include <string>

  int main() {
    std::string str;
    value_category_of(static_cast<std::string&>(str));
    // getline 返回 istream&
    value_category_of(std::getline(std::cin, line));
    // 重载的 operator<< 返回 ostream&
    value_category_of(std::cout << "Hello world.\n");
  }
  ```

- 转换到函数类型的右值引用的转型表达式、返回函数类型的右值引用函数调用表达式，其中也包括重载的运算符。

  ```cpp
  using func = void();

  void foo() {}
  func&& bar() { return foo; }

  int main() {
    value_category_of(static_cast<func&&>(foo));
    value_category_of(bar());
  }
  ```

- 内建的逗号表达式`a, b`中，`b`是左值的情况。

  ```cpp
  int a = 0, b;
  (a, b) = 42; // OK，修改了b
  value_category_of((a, b));
  ```

- 条件表达式`c ? a : b`的某些情况。例如`a`和`b`是类型相同的左值，或者其中一个是`throw`表达式而另一个是左值，具体情况比较复杂，可参阅[cppreference](https://zh.cppreference.com/w/cpp/language/operator_other#.E6.9D.A1.E4.BB.B6.E8.BF.90.E7.AE.97.E7.AC.A6)。

  ```cpp
  int a, b;
  ( true ? a : b) = 42;       // OK，修改了a
  (false ? throw 0 : b) = 42; // OK，修改了b
  ( true ? a : 0) = 42; // Error，此条件表达式是纯右值

  value_category_of(true ? a : b);
  value_category_of(false ? throw 0 : b);
  value_category_of(true ? a : 0);
  ```

- 具有左值引用类型的非类型模板形参。

  ```cpp
  #include <iostream>
  template<int& a, int b>
  void foo() {
    a = b; // OK, (a)是左值，(b)是纯右值。
  value_category_of(a);
  value_category_of(b);
  }
  int main() {
    // 左值引用非类型模板形参必须绑定到静态存储期的对象
    static int a;
    foo<a, 42>();
    std::cout << a;
  }
  ```

### 2.3 纯右值（prvalue）

与左值相对的是纯右值，它表示的是初始化某个对象，或者某项计算的结果。

下列表达式是纯右值表达式：

- 除字符串字面量之外的字面量，包括字符字面量、整数字面量、浮点字面量、布尔字面量、空指针字面量。用户自定义字面量属于重载的运算符，按照函数的规则处理。

  ```cpp
  auto operator""_a(unsigned long long v) {
    return v;
  }
  auto& operator""_a(long double v) {
    static long double a;
    a = v;
    return a;
  }
  char&& operator""_a(char v) {
    static char a;
    a = v;
    return (char&&)a;
  }
  int main() {
    value_category_of('a');
    value_category_of(114);
    value_category_of(3.14);
    value_category_of(true);
    value_category_of(false);
    value_category_of(nullptr);
    value_category_of(0_a);   // -> prvalue
    value_category_of(0.0_a); // -> lvalue
    value_category_of('a'_a); // -> xvalue
  }
  ```

- 枚举项。

  ```cpp
  enum E { e1, e2 };
  value_category_of(e1);
  ```

- `this`指针。

  ```cpp
  struct A {
    void foo() {
      value_category_of(this);
    }
  };
  int main() {
    A a; a.foo();
  }
  ```

- 内建的后缀自增/自减表达式`a++`&#8203;`a--`、算术表达式`+a`&#8203;`-a`&#8203;`a+b`&#8203;`a-b`&#8203;`a*b`&#8203;`a/b`&#8203;`a%b`&#8203;`~a`&#8203;`a&b`&#8203;`a|b`&#8203;`a^b`&#8203;`a<<b`&#8203;`a>>b`、逻辑表达式`a&&b`&#8203;`a||b`&#8203;`!a`、比较表达式`a<b`&#8203;`a<=b`&#8203;`a==b`&#8203;`a>=b`&#8203;`a>b`&#8203;`a!=b`&#8203;`a<=>b`、取地址表达式`&a`。

  ```cpp
  int a, b;
  value_category_of(a++);
  value_category_of(+a);
  value_category_of(a+b);
  value_category_of(a^b);
  value_category_of(a>=b);
  value_category_of(&a);
  ```

- 内建的逗号表达式`a, b`中，`b`是纯右值的情况。

  ```cpp
  value_category_of((a,0));
  ```

- 条件表达式`c ? a : b`的某些情况。例如`a`和`b`其中一个是纯右值，具体情况比较复杂，可参阅[cppreference](https://zh.cppreference.com/w/cpp/language/operator_other#.E6.9D.A1.E4.BB.B6.E8.BF.90.E7.AE.97.E7.AC.A6)。

  ```cpp
  value_category_of(true?0:a);
  ```

- 成员访问表达式`a.m`&#8203;`p->m`&#8203;`a.*mp`&#8203;`p->*mp`中，`m`是非静态成员函数或成员枚举项的情况。访问非静态成员函数的成员访问表达式是一种特殊的纯右值表达式，它只能用作函数调用运算符的左操作数。

  ```cpp
  struct A {
    enum E { e1 };
    void foo() {}
  };
  int main() {
    A a;
    value_category_of(a.e1);
    // 无法直接检测这种表达式的值类别
    // value_category_of(a.foo);
    a.foo();
  }
  ```

- 转换到非引用类型的转型表达式、返回类型是非引用的函数调用或重载运算符表达式。

  ```cpp
  value_category_of((int)2.5);
  value_category_of(std::string("Hello"));
  value_category_of(printf("Hello"));
  ```

- 标量类型的非类型模板形参。

  ```cpp
  template<size_t N>
  void foo() {
    value_category_of(N);
  }
  int main() {
    foo<0>();
  }
  ```

- lambda表达式。
  
  ```cpp
    value_category_of([]{});
  ```

- `requires`表达式和概念的特化。

  ```cpp
  value_category_of(requires{ 1 + 1; });
  value_category_of((std::same_as<int, float>));
  ```

### 2.4 亡值（xvalue）

亡值表示那些资源可以被重用或移动的对象，因此它与移动语义有着密不可分的联系。C++11引入这个概念也正是为了支持移动语义。

下列表达式是亡值表达式：

- 成员访问表达式`a.m`&#8203;`a.*mp`中，`a`是右值且`m`是非静态数据成员或`mp`指向非静态数据成员的情况。

  ```cpp
  struct A { int a; };
  int main() {
    value_category_of(A().a);
  }
  ```

- 内建的下标表达式`a[n]`，其中一个操作数是数组右值。

  ```cpp
  using arr = int[3];
  int main() {
    value_category_of((arr{1,2,3}[0]));
  }
  ```

- 内建的逗号表达式`a, b`中，`b`是亡值的情况。

  ```cpp
  value_category_of((0, arr{1,2,3}[0]));
  ```

- 条件表达式`c ? a : b`的某些情况。例如`a`和`b`是相同类型的亡值，具体情况比较复杂，可参阅[cppreference](https://zh.cppreference.com/w/cpp/language/operator_other#.E6.9D.A1.E4.BB.B6.E8.BF.90.E7.AE.97.E7.AC.A6)。

  ```cpp
  value_category_of((true?arr{1,2,3}[0]:arr{1,2,3}[1]));
  ```

- 转换到对象类型右值引用的转型表达式、返回类型类为对象类型右值引用的函数调用表达式，其中也包括重载的运算符。例如`static_cast<int&&>(x)`&#8203;`std::move(x)`。

  ```cpp
  int a;
  value_category_of(std::move(a));
  value_category_of((int&&)a);
  ```

- 在临时量实质化后，任何指代该临时对象的表达式。

  ```cpp
  // 为了将右值引用绑定到纯右值，
  // 必须实质化临时量，纯右值隐式转换到亡值。
  int&& r = 42;
  ```

- 有移动资格的表达式。

  如果某个标识表达式指代一个具有自动存储期的非`volatile`限定的对象，或是绑定到此类对象的右值引用，那么称它是`可隐式移动实体`。下列标识表达式是有移动资格的：

  - 它是`return`或`co_return`语句的操作数，并且它指代的可隐式移动实体在当前函数体或者参数列表中声明。

    ```cpp
    #include <cstdio>
    struct A {
      A() { }
      A(const A&) { puts("Copy"); }
      A(A&&) { puts("Move"); }
    };

    A foo(A a1, int cond) {
      A a2;
      A&& a3 = (A&&)a1;
      A& a4 = a2;
      switch(cond) {
        case 1: return a1; // Move
        case 2: return a2; // Move
        case 3: return a3; // Move
        case 4: return a4; // Copy
        default: return{};
      }
    }

    int main() {
      A a1 = foo(A{}, 1); // Move
      A a2 = foo(A{}, 2); // Move
      A a3 = foo(A{}, 3); // Move
      A a4 = foo(A{}, 4); // Copy
    }
    ```

  - 它是`throw`表达式的操作数，并且它指代的可隐式移动实体的生存期不会延续到最内层`try`块的作用域之后。

    ```cpp
    #include <cstdio>

    struct A {
      A() { }
      A(const A&) { puts("Copy"); }
      A(A&&) { puts("Move"); }
    };

    int main() try {
      A a1;
      try {
          throw a1; // Copy
      }catch(const A& a){ }
      throw a1; // Move
    }catch(const A& a) { }
    ```

### 2.4 成员访问表达式

成员访问表达式`a.m`的值类别如下表所示。而`p->m`&#8203;`a.*mp`&#8203;`p->*mp`可以看作是`a.m`的特殊情况。此外，成员访问表达式期待其左操作数是泛左值，因此`a`是纯右值的情况实际上会发生[临时量实质化](#33-临时量实质化)，值类别转换为亡值。

- `p->m`：等价于`(*p).m`，即`a`是左值的情况;

- `a.*mp`：指向成员的指针只能指向非静态成员，即`m`是非静态成员的情况；

- `p->*mp`：上述两种情况的结合，即`a`是左值且`m`是非静态成员的情况；

|`a.m`|`a`是左值|`a`是亡值|`a`是纯右值|
|:-:|:-:|:-:|:-:|
|`m`是非静态数据成员|左值|亡值|亡值|
|`m`是非静态成员函数|纯右值|纯右值|纯右值|
|`m`是静态数据成员|左值|左值|左值|
|`m`是静态成员函数|左值|左值|左值|
|`m`是成员枚举项|纯右值|纯右值|纯右值|

访问非静态成员函数的成员访问表达式是一种特殊的纯右值表达式，它只能用作函数调用运算符的左操作数。

## 三、值变换

值类别之间可以相互转换，每当某个语句期待的值类别与表达式的值类别不同时，发生值变换。

### 3.1 左值到右值

任何非函数、非数组类型`T`的泛左值都可以转换为纯右值。

转换的结果根据以下规则确定：

- 如果`T`是`std::nullptr_t`，那么结果是`nullptr`。并且这一过程不会访问该泛左值指代的对象。该对象即使有`volatile`限定也不会有副作用，它也可以是联合体的非活跃成员。

  ```cpp
  #include <cstddef>
  union U {
    int a; float b;
    volatile std::nullptr_t c;
  };

  int main() {
    U u{ 42 };
    // 读取联合体的非活跃成员是未定义行为。
    float ub = u.b;
    // OK，访问nullptr_t不会发生读取。
    int* null = u.c;
  }
  ```

- 否则，如果`T`具有类类型，那么转换会从该泛左值复制初始化一个结果对象。

  ```cpp
  struct A {};
  void foo(A a) {};
  int main() {
    A aaa;
    // foo的参数期待A的纯右值，
    // 以左值实参调用foo时复制初始化其参数a
    foo(aaa);
  }
  ```

- 否则，结果是该泛左值表示的对象，并且该对象会被读取。

对于结果的类型：

- 如果`T`不是类类型，那么作为结果的纯右值的类型是`T`的无`cv`限定版本；

- 如果`T`是类类型，那么作为结果的纯右值的类型是`T`；

  ```cpp
  struct A {
    A() { }
    // 复制构造不接受const对象
    A(A&) { }
  };
  void foo(A a) { }
  void foo(int i) { }
  int main() {
    // Error，复制初始化
    // 找不到合适的复制构造函数
    const A a;
    foo(a);

    // OK，内置类型左值到右值转换时丢弃const
    const int i = 42;
    foo(i);
  }
  ```

### 3.2 数组到指针

元素类型`T`的数组的左值或右值，可隐式转换成指向`T`的指针类型的纯右值。如果数组是纯右值，那么就会发生临时量实质化。产生的指针指向数组首元素。

```cpp
const char* str1 = "Hello world.";
const char* str2 = &"Hello world."[0];
// 注意显式取地址和隐式转换得到的指针类型不同
const char(*p)[13] = &"Hello world.";
```

### 3.3 函数到指针

函数类型的左值，可隐式转换成指向该函数的指针的纯右值。这不适用于非静态成员函数，因为不存在指代非静态成员函数的左值。

```cpp
void foo() { }
// 函数到指针可隐式转换，
// 因此取地址运算符不是必须的
void (*p1)() = foo;
void (*p2)() = &foo;
```

### 3.4 临时量实质化

任何完整类型`T`的纯右值，可转换成同类型`T`的亡值。此转换以该纯右值初始化一个`T`类型的临时对象，以临时对象作为求值该纯右值的结果对象，并产生一个代表该临时对象的亡值。如果`T`是类类型或类类型的数组，那么它必须有可访问且未被弃置的析构函数。

临时量实质化在下例情况下发生：

- 绑定引用到纯右值时；

- 在类纯右值上进行成员访问时；

- 进行数组到指针转换或在数组纯右值上使用下标时；

- 以花括号初始化器列表初始化`std::initializer_list<T>`类型的对象时；

- 纯右值用于`sizeof`和`typeid`的操作数，这是形式上的要求，这两个运算符要求操作数在语境中可析构；

- 纯右值作为弃值表达式时；

注意临时量实质化在从纯右值初始化同类型对象（由直接初始化或复制初始化）时不出现：直接从初始化器初始化这种对象。这确保“受保证的复制消除”。

```cpp
#include <cstdio>
#include <typeinfo>
struct A {
  int a;
  A():a(42) { puts("A::A()"); }
  ~A() { puts("A::~A()"); }
};
A foo() { return A{}; }
int main() {
  // 绑定引用到纯右值。
  const A& r1 = A();
  A&& r2 = foo();

  // std::initializer_list
  for (auto i : { 1,2,3,4,5 })
    printf("%d ", i);

  // typeid sizeof虽然是不求值语境，但是要求表达式的类型可析构
  printf(
    "%s: %zu %d\n",
    typeid(A()).name(),
    sizeof(A{}),
    A().a);

  // 弃值表达式
  (void)foo();

  // 受保证的复制消除，没有临时量实质化
  A a = foo();
}
```

## 四、参考文献

- cppreference - [值类别](https://zh.cppreference.com/w/cpp/language/value_category)

- cppreference - [值变换](https://zh.cppreference.com/w/cpp/language/implicit_conversion#.E5.80.BC.E5.8F.98.E6.8D.A2)

- cppreference - [decltype](https://zh.cppreference.com/w/cpp/language/decltype)

- 6.7.7 Temporary objects [[class.temporary]](https://eel.is/c++draft/class.temporary)

- 7.2.1 Value category [[basic.lval]](https://eel.is/c++draft/basic.lval)

- 9.2.9.5 Decltype specifiers [[dcl.type.decltype]](https://eel.is/c++draft/dcl.type.decltype)
package com.example.tests;

import java.util.regex.Pattern;
import java.util.concurrent.TimeUnit;
import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;

public class CreateNewGroupAndDelete {
  private WebDriver driver;
  private String baseUrl;
  private boolean acceptNextAlert = true;
  private StringBuffer verificationErrors = new StringBuffer();

  @Before
  public void setUp() throws Exception {
    driver = new FirefoxDriver();
    baseUrl = "http://127.0.0.1:8081/lobby/TT2022/2";
    driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
  }

  @Test
  public void testCreateNewGroupAndDelete() throws Exception {
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[3]/div/div/div/div/div")).click();
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[3]/div/div/div[2]/div/div")).click();
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[4]/div/input")).clear();
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[4]/div/input")).sendKeys("New Group :)");
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[4]/div[2]/button")).click();
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[2]/div/div/div/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='userlist-container']/div[4]/div[2]/div/button")).click();
  }

  @After
  public void tearDown() throws Exception {
    driver.quit();
    String verificationErrorString = verificationErrors.toString();
    if (!"".equals(verificationErrorString)) {
      fail(verificationErrorString);
    }
  }

  private boolean isElementPresent(By by) {
    try {
      driver.findElement(by);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  private boolean isAlertPresent() {
    try {
      driver.switchTo().alert();
      return true;
    } catch (NoAlertPresentException e) {
      return false;
    }
  }

  private String closeAlertAndGetItsText() {
    try {
      Alert alert = driver.switchTo().alert();
      String alertText = alert.getText();
      if (acceptNextAlert) {
        alert.accept();
      } else {
        alert.dismiss();
      }
      return alertText;
    } finally {
      acceptNextAlert = true;
    }
  }
}

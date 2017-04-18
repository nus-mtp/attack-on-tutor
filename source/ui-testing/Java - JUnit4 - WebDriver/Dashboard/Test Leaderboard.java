package com.example.tests;

import java.util.regex.Pattern;
import java.util.concurrent.TimeUnit;
import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;

public class TestLeaderboard {
  private WebDriver driver;
  private String baseUrl;
  private boolean acceptNextAlert = true;
  private StringBuffer verificationErrors = new StringBuffer();

  @Before
  public void setUp() throws Exception {
    driver = new FirefoxDriver();
    baseUrl = "http://127.0.0.1:8081/dashboard";
    driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
  }

  @Test
  public void testLeaderboard() throws Exception {
    driver.findElement(By.xpath("//div[@id='tutorials']/div/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[2]/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[2]/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[3]/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[3]/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[4]/div/div[2]/button[2]")).click();
    driver.findElement(By.xpath("//div[@id='tutorials']/div[4]/div/div[2]/button[2]")).click();
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
